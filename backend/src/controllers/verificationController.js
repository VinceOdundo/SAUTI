const User = require("../models/User");
const Organization = require("../models/Organization");
const VerificationRequest = require("../models/VerificationRequest");
const { uploadToS3, deleteFromS3 } = require("../utils/s3");
const { sendVerificationEmail, sendVerificationStatusEmail, sendAdminNotificationEmail } = require("../services/emailService");
const { validateVerificationDocuments } = require("../utils/documentValidator");
const { NotFoundError, ValidationError } = require("../utils/errors");

exports.submitVerification = async (req, res) => {
  try {
    const { documentType, documentNumber, entityType = 'user' } = req.body;
    const { idDocument, selfie, additionalDocuments = [] } = req.files;
    const userId = req.user.id;

    // Validate document format and size
    const validationResult = await validateVerificationDocuments(idDocument, selfie, additionalDocuments);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.error);
    }

    // Upload documents to S3
    const uploadPromises = [
      uploadToS3(idDocument, `verifications/${userId}/id`),
      uploadToS3(selfie, `verifications/${userId}/selfie`)
    ];

    // Upload additional documents if provided
    const additionalDocsUrls = [];
    if (additionalDocuments.length > 0) {
      for (let i = 0; i < additionalDocuments.length; i++) {
        uploadPromises.push(
          uploadToS3(additionalDocuments[i], `verifications/${userId}/additional_${i}`)
        );
      }
    }

    const uploadedUrls = await Promise.all(uploadPromises);
    const [idDocumentUrl, selfieUrl, ...additionalUrls] = uploadedUrls;

    // Create verification request
    const verificationRequest = await VerificationRequest.create({
      user: userId,
      entityType,
      documentType,
      documentNumber,
      documentUrl: idDocumentUrl,
      selfieUrl: selfieUrl,
      additionalDocuments: additionalUrls.map((url, index) => ({
        url,
        name: additionalDocuments[index]?.originalname || `Additional Document ${index + 1}`
      })),
      status: 'pending',
      submittedAt: new Date()
    });

    // Update entity verification status
    if (entityType === 'organization') {
      await Organization.findOneAndUpdate(
        { representatives: { $elemMatch: { user: userId, role: 'admin' } } },
        {
          verificationStatus: 'pending',
          'verificationDocuments.submittedAt': new Date(),
          $set: {
            'verificationDocuments.certificate.url': idDocumentUrl,
            'verificationDocuments.additionalDocs': additionalUrls.map((url, index) => ({
              url,
              name: additionalDocuments[index]?.originalname || `Additional Document ${index + 1}`
            }))
          }
        }
      );
    } else {
      await User.findByIdAndUpdate(userId, {
        verificationStatus: 'pending',
        'verification.documentType': documentType,
        'verification.documentNumber': documentNumber,
        'verification.submittedAt': new Date()
      });
    }

    // Send notifications
    await Promise.all([
      sendVerificationStatusEmail(req.user.email, 'submitted', req.user.name),
      sendAdminNotificationEmail('verification_request', {
        requestId: verificationRequest._id,
        entityType,
        userName: req.user.name
      })
    ]);

    res.status(201).json({
      success: true,
      message: "Verification request submitted successfully",
      request: verificationRequest
    });
  } catch (error) {
    // Clean up uploaded files if there was an error
    if (error.uploadedUrls) {
      await Promise.all(error.uploadedUrls.map(url => deleteFromS3(url)));
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error submitting verification request",
      error: error.details || error.message
    });
  }
};

exports.approveVerification = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes, validUntil } = req.body;

    const verificationRequest = await VerificationRequest.findById(requestId)
      .populate('user');

    if (!verificationRequest) {
      throw new NotFoundError("Verification request not found");
    }

    // Update verification request
    verificationRequest.status = 'approved';
    verificationRequest.reviewedBy = req.user.id;
    verificationRequest.reviewedAt = new Date();
    verificationRequest.notes = notes;
    verificationRequest.validUntil = validUntil;
    await verificationRequest.save();

    // Update entity status
    if (verificationRequest.entityType === 'organization') {
      await Organization.findOneAndUpdate(
        { representatives: { $elemMatch: { user: verificationRequest.user._id, role: 'admin' } } },
        {
          verified: true,
          verificationStatus: 'approved',
          'verificationDocuments.certificate.verified': true,
          'verificationDocuments.certificate.verifiedAt': new Date(),
          'verificationDocuments.certificate.verifiedBy': req.user.id
        }
      );
    } else {
      await User.findByIdAndUpdate(verificationRequest.user._id, {
        verificationStatus: 'approved',
        'verification.approvedAt': new Date(),
        'verification.approvedBy': req.user.id,
        'verification.validUntil': validUntil
      });
    }

    // Send notifications
    await Promise.all([
      sendVerificationStatusEmail(
        verificationRequest.user.email,
        'approved',
        verificationRequest.user.name,
        {
          notes,
          validUntil
        }
      ),
      sendAdminNotificationEmail('verification_approved', {
        requestId: verificationRequest._id,
        entityType: verificationRequest.entityType,
        userName: verificationRequest.user.name,
        adminName: req.user.name
      })
    ]);

    res.json({
      success: true,
      message: "Verification request approved",
      request: verificationRequest
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error approving verification request",
      error: error.details || error.message
    });
  }
};

exports.rejectVerification = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason, notes } = req.body;

    const verificationRequest = await VerificationRequest.findById(requestId)
      .populate('user');

    if (!verificationRequest) {
      throw new NotFoundError("Verification request not found");
    }

    // Update verification request
    verificationRequest.status = 'rejected';
    verificationRequest.reviewedBy = req.user.id;
    verificationRequest.reviewedAt = new Date();
    verificationRequest.rejectionReason = reason;
    verificationRequest.notes = notes;
    await verificationRequest.save();

    // Update entity status
    if (verificationRequest.entityType === 'organization') {
      await Organization.findOneAndUpdate(
        { representatives: { $elemMatch: { user: verificationRequest.user._id, role: 'admin' } } },
        {
          verificationStatus: 'rejected',
          'verificationDocuments.certificate.verified': false
        }
      );
    } else {
      await User.findByIdAndUpdate(verificationRequest.user._id, {
        verificationStatus: 'rejected',
        'verification.rejectedAt': new Date(),
        'verification.rejectedBy': req.user.id,
        'verification.rejectionReason': reason
      });
    }

    // Clean up S3 files
    const filesToDelete = [
      verificationRequest.documentUrl,
      verificationRequest.selfieUrl,
      ...(verificationRequest.additionalDocuments || []).map(doc => doc.url)
    ];
    await Promise.all(filesToDelete.map(url => deleteFromS3(url)));

    // Send notifications
    await Promise.all([
      sendVerificationStatusEmail(
        verificationRequest.user.email,
        'rejected',
        verificationRequest.user.name,
        {
          reason,
          notes
        }
      ),
      sendAdminNotificationEmail('verification_rejected', {
        requestId: verificationRequest._id,
        entityType: verificationRequest.entityType,
        userName: verificationRequest.user.name,
        adminName: req.user.name,
        reason
      })
    ]);

    res.json({
      success: true,
      message: "Verification request rejected",
      request: verificationRequest
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error rejecting verification request",
      error: error.details || error.message
    });
  }
};

exports.getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const entityType = req.query.entityType || 'user';

    let verificationStatus;
    if (entityType === 'organization') {
      const organization = await Organization.findOne({
        representatives: { $elemMatch: { user: userId, role: 'admin' } }
      });
      verificationStatus = organization ? {
        status: organization.verificationStatus,
        documents: organization.verificationDocuments,
        verified: organization.verified
      } : null;
    } else {
      const user = await User.findById(userId).select('verificationStatus verification');
      verificationStatus = user ? {
        status: user.verificationStatus,
        verification: user.verification
      } : null;
    }

    if (!verificationStatus) {
      throw new NotFoundError("Verification status not found");
    }

    res.json({
      success: true,
      verificationStatus
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error fetching verification status",
      error: error.details || error.message
    });
  }
};
