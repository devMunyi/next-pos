import { createCipheriv, createDecipheriv, createHash } from "crypto";

import { ENV } from "@/lib/env.client";



export const makePhoneValid = (phone: string): string => {
    phone = phone.trim().replace(/\s+/g, "").replace(/\+/g, "");

    // Read the country code from environment variable
    const ccStr = process.env.COUNTRY_CODE?.toString().trim();

    let cc: number = 0;
    if (ccStr) {
        cc = parseInt(ccStr, 10);
    }

    if (isNaN(cc) || cc <= 0) {
        cc = 254;
    }

    if (phone.length === 12 && phone.slice(0, 3) === cc.toString()) {
        return phone;
    } else {
        if (phone.startsWith("0")) {
            phone = phone.replace(/^0+/, "");
            const vphone: string = cc.toString() + phone;
            return vphone;
        } else {
            return cc.toString() + phone;
        }
    }
};

export const isPhoneValid = (phone: string): boolean => {
    // Read the country code from environment variable
    const ccStr = process.env.COUNTRY_CODE?.toString().trim();
    let cc = 0;
    if (ccStr) {
        cc = parseInt(ccStr, 10);
    }

    if (isNaN(cc) || cc <= 0) {
        cc = 254;
    }

    // Check if the phone contains only digits
    const digitOnlyRegex = /^\d+$/;
    if (!digitOnlyRegex.test(phone)) {
        return false;
    }

    if (phone.length === 12 && phone.slice(0, 3) === cc.toString()) {
        return true;
    } else {
        return false;
    }
};

export const isValidEmail = (email: string): boolean => {
    // Regular expression pattern for email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Test the email against the pattern
    return emailPattern.test(email.trim());
};

export const hashPhoneNumber = (primaryMobile: string): string =>
    createHash("sha256").update(primaryMobile).digest("hex");

export const castToIntegerNum = (
    value: null | undefined | string,
    defaultNum: number = 0
): number => {
    if (typeof value === "object" || Array.isArray(value)) {
        return defaultNum;
    }
    const parsedValue = parseInt(String(value), 10);
    return isNaN(parsedValue) ? defaultNum : parsedValue;
};

export const castToDecimalNum = (
    value: null | undefined | string,
    defaultNum: number = 0,
    decimals: number = 2
): number => {
    if (typeof value === "object" || Array.isArray(value)) {
        return defaultNum;
    }

    const parsedValue = parseFloat(String(value));
    return isNaN(parsedValue)
        ? defaultNum
        : parseFloat(parsedValue.toFixed(decimals));
};
export const castToString = (value: string | number | undefined | null, defaultStr: string = ""): string => {
    if (typeof value === "string") {
        return value.trim();
    }

    if (value == null) {
        return defaultStr; // Handle null and undefined explicitly
    }

    return String(value); // Convert numbers, objects, etc., to string
};


// Generate a random string
export const generateRandomString = (length: number): string => {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

export const generateRandomNumber = (length: number): number => {
    const characters = "0123456789";
    const charactersLength = characters.length;
    return castToIntegerNum(
        Array.from(
            { length },
            () => characters[Math.floor(Math.random() * charactersLength)]
        ).join("")
    );
};

export const getCountryCode = (): number =>
    castToIntegerNum(ENV.COUNTRY_CODE, 254);
export type CountryCurrency = {
    local: string;
    IS: string;
};
export const getCountryCurrency = (cc: number): CountryCurrency => {
    let currency = {
        local: "Ksh",
        IS: "KES",
    };
    switch (cc) {
        case 256:
            currency = { local: "Ush", IS: "UGX" };
            break;
        case 254:
            currency = { local: "Ksh", IS: "KES" };
            break;
        case 255:
            currency = { local: "Tsh", IS: "TZS" };
            break;
        default:
            currency = { local: "Ksh", IS: "KES" };
    }

    return currency;
};

export const moneyFormat = (num: number) =>
    Number(num).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });


// Function to encrypt data
export function encryptData(
    rawData: string,
    key: string,
    iv: string
): string | null {
    try {
        // Ensure the key and iv are of the correct length for AES-256-CBC
        if (key.length !== 32 || iv.length !== 16) {
            throw new Error(
                "Invalid key or iv length. Key must be 32 bytes and IV must be 16 bytes."
            );
        }

        const cipher = createCipheriv(
            "aes-256-cbc",
            Buffer.from(key, "utf-8"),
            Buffer.from(iv, "utf-8")
        );
        let encrypted = cipher.update(rawData, "utf-8", "base64");
        encrypted += cipher.final("base64");
        return encrypted;
    } catch (error) {
        console.error("Encryption failed:", error);
        return null;
    }
}

// Function to decrypt data
export function decryptData(
    encData: string,
    key: string,
    iv: string
): string | null {
    try {
        // Ensure the key and iv are of the correct length for AES-256-CBC
        if (key.length !== 32 || iv.length !== 16) {
            throw new Error(
                "Invalid key or iv length. Key must be 32 bytes and IV must be 16 bytes."
            );
        }

        const decipher = createDecipheriv(
            "aes-256-cbc",
            Buffer.from(key, "utf-8"),
            Buffer.from(iv, "utf-8")
        );
        let decrypted = decipher.update(encData, "base64", "utf-8");
        decrypted += decipher.final("utf-8");
        return decrypted;
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
}

// Function to get B2C token configuration
export function getB2CTokenConfig(): { tokenKey: string; tokenSecret: string } {
    const tokenKey = process.env.B2C_TOKEN_KEY || "";
    const tokenSecret = process.env.B2C_TOKEN_SECRET || "";

    return {
        tokenKey,
        tokenSecret,
    };
}

export function capitalizeString(val: string): string {
    if (!val) return "";
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
}
export function formatToTwoDecimalPlaces(num: number | string | null | undefined, dp = 2): number {
    const parsedNum = parseFloat(String(num));

    // Check if the parsed value is a valid number
    if (
        isNaN(parsedNum) ||
        typeof dp !== "number" ||
        dp < 0 ||
        !Number.isInteger(dp)
    ) {
        throw new Error("Invalid input or decimal places.");
    }

    // Format the number to the specified decimal places
    return Number(parsedNum.toFixed(dp));
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
    currency: "KSH",
    style: "currency",
    minimumFractionDigits: 2,
});

export function formatCurrency(amount: number | string | null) {
    if (typeof amount === "number") {
        return CURRENCY_FORMATTER.format(amount)
            .replace("KSH", "Ksh")
            .replace(" ", "");
    } else if (typeof amount === "string") {
        return CURRENCY_FORMATTER.format(Number(amount))
            .replace("KSH", "Ksh")
            .replace(" ", "");
    } else {
        return "NaN";
    }
}


export function unescapeString(input: string): string {
    // First trim the input, then replace all backslashes with empty string
    const trimmed = input?.trim() || ""; // Ensure we have a string to work with
    const withoutBackslashes = trimmed.replace(/\\/g, '');

    return withoutBackslashes.length <= 1 ? "" : withoutBackslashes;
}

export function getErrorMessage<DefaultMessage extends string>(
    error: unknown,
    defaultMessage: DefaultMessage = 'An error occurred' as DefaultMessage
): string | DefaultMessage {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    return defaultMessage
}


export const formatCurrency2 = (value: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'KSH',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(value));
};
