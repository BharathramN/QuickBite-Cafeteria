import QRCode from 'qrcode';

export const generateQrCodeDataUrl = async (payload) => {
  try {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 280,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    return '';
  }
};
