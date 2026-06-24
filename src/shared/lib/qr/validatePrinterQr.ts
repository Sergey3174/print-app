type PrinterQrValidationResult =
  | {
      isValid: true;
      pid: string;
    }
  | {
      isValid: false;
      errorMessage: string;
    };

export function validatePrinterQr(value: string): PrinterQrValidationResult {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    return {
      isValid: false,
      errorMessage: "QR code must contain a valid link",
    };
  }

  const pid = parsedUrl.searchParams.get("pid")?.trim();

  if (!pid) {
    return {
      isValid: false,
      errorMessage: "Printer link must contain pid parameter",
    };
  }

  return {
    isValid: true,
    pid,
  };
}
