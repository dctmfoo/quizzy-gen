/**
 * Constants for assertion-reason question options
 */

export const ASSERTION_REASON_OPTIONS = {
  "a": "Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of the Assertion (A)",
  "b": "Both Assertion (A) and Reason (R) are true, but Reason (R) is not the correct explanation of the Assertion (A)",
  "c": "Assertion (A) is true, but Reason (R) is false",
  "d": "Assertion (A) is false, but Reason (R) is true"
};

// Helper function to get full text from option code
export const getAssertionReasonOptionText = (code) => {
  // Remove any parentheses and trim whitespace from the code
  const cleanCode = code.replace(/[()]/g, '').trim().toLowerCase();
  return ASSERTION_REASON_OPTIONS[cleanCode] || code;
}; 