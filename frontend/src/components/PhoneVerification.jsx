import { useState } from "react";
import api from "../utils/axiosConfig";

const PhoneVerification = ({ onVerificationComplete }) => {
  const [step, setStep] = useState("request"); // "request" or "verify"
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRequestCode = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post("/phone-verification/send");
      setStep("verify");
    } catch (error) {
      setError(
        error.response?.data?.message || "Error sending verification code"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await api.post("/phone-verification/verify", { otp });
      onVerificationComplete();
    } catch (error) {
      setError(error.response?.data?.message || "Error verifying code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-700 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Phone Verification</h2>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
      )}

      {step === "request" ? (
        <div>
          <p className="text-gray-300 mb-4">
            Click the button below to receive a verification code via SMS.
          </p>
          <button
            onClick={handleRequestCode}
            disabled={loading}
            className="w-full bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <div className="mb-4">
            <label
              htmlFor="otp"
              className="block text-gray-300 text-sm font-medium mb-2"
            >
              Enter Verification Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-dark-600 text-white px-4 py-2 rounded focus:ring-primary-500 focus:border-primary-500"
              maxLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      )}
    </div>
  );
};

export default PhoneVerification;
