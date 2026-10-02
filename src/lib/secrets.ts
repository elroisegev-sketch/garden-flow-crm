function luhnOk(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let alternate = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = digits.charCodeAt(index) - 48;
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function cardCandidates(text: string): string[] {
  const collapsed = text.replace(/(\d)[\s-]+(?=\d)/g, "$1");
  return collapsed.match(/\d{13,19}/g) ?? [];
}

export function findPaymentSecret(text: string): string | null {
  if (/\b(cvv|cvc|cid)\b\s*[:\-]?\s*\d{3,4}\b/i.test(text) || /קוד\s*(אבטחה|סודי)/.test(text)) {
    return "אין לשמור CVV או קוד אבטחה של כרטיס אשראי באפליקציה.";
  }
  if (cardCandidates(text).some(luhnOk)) {
    return "נראה כמו מספר אשראי מלא. שמרו רק שם ספק או 4 ספרות אחרונות, בלי המספר המלא.";
  }
  return null;
}

export function assertNoPaymentSecrets(...parts: Array<string | null | undefined>): void {
  const problem = findPaymentSecret(parts.filter(Boolean).join("\n"));
  if (problem) throw new Error(problem);
}
