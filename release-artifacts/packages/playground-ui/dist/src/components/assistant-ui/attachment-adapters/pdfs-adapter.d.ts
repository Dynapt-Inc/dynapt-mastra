import { AttachmentAdapter, PendingAttachment, CompleteAttachment } from '@assistant-ui/react';

export declare class PDFAttachmentAdapter implements AttachmentAdapter {
    accept: string;
    add({ file }: {
        file: File;
    }): Promise<PendingAttachment>;
    send(attachment: PendingAttachment): Promise<CompleteAttachment>;
    remove(attachment: PendingAttachment): Promise<void>;
    private fileToBase64;
    private extractTextFromPDF;
}
