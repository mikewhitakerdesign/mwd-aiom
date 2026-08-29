export declare const REQUIRED_ATTRIBUTION_LINE: string;

export declare function validatePrAttribution(body: string | null | undefined): {
  valid: boolean;
  errors: string[];
};
