import { type EmailKeshiOpts } from "./template.js";
export type TemplateEsempio = {
    slug: string;
    titolo: string;
    subject: string;
    opts: EmailKeshiOpts;
};
export declare const TEMPLATE_ESEMPIO: TemplateEsempio[];
export declare function writePreview({ out, product }: {
    out: string;
    product?: string;
}): string[];
