import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";

const REPORT_REASONS = [
  "Hate speech or discrimination",
  "Harassment or bullying",
  "Misinformation",
  "Spam",
  "Violence or threats",
  "Other",
];

const ReportModal = ({ isOpen, onClose, onReport, isLoading }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const reason = selectedReason === "Other" ? otherReason : selectedReason;
    onReport(reason);
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>

          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Report Post
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why are you reporting this post?
                  </label>
                  <div className="space-y-2">
                    {REPORT_REASONS.map((reason) => (
                      <div key={reason} className="flex items-center">
                        <input
                          type="radio"
                          id={reason}
                          name="reason"
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label
                          htmlFor={reason}
                          className="ml-3 block text-sm text-gray-700"
                        >
                          {reason}
                        </label>
                      </div>
                    ))}
                  </div>

                  {selectedReason === "Other" && (
                    <div className="mt-3">
                      <textarea
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                        placeholder="Please specify the reason..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        required
                        maxLength={500}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      !selectedReason ||
                      (selectedReason === "Other" && !otherReason)
                    }
                    className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                      isLoading ||
                      !selectedReason ||
                      (selectedReason === "Other" && !otherReason)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isLoading ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ReportModal;