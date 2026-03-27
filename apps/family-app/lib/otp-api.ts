import { getServiceBaseUrl, requestJson } from '@/lib/api-base';

const USERDATA_API_PORT = 3002;

const userdataApiBaseUrl = getServiceBaseUrl(USERDATA_API_PORT);

export async function sendOtp(phone: string) {
  return requestJson<{ success: boolean }>(userdataApiBaseUrl, '/otp/send', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(phone: string, code: string) {
  return requestJson<{
    verified: boolean;
    user?: { name: string; phone: string };
    isNewUser?: boolean;
  }>(userdataApiBaseUrl, '/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
}
