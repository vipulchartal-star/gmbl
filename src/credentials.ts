import { Platform } from 'react-native';

export const parseCredentialText = (content: string) => {
  const entries = Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex === -1) {
          return ['', ''];
        }

        return [line.slice(0, separatorIndex).trim(), line.slice(separatorIndex + 1).trim()];
      })
      .filter(([key, value]) => key && value),
  ) as Record<string, string>;

  return {
    loginId: entries.login_id ?? '',
    username: entries.username ?? '',
    password: entries.password ?? '',
  };
};

export const readCredentialFile = () =>
  new Promise<string>((resolve, reject) => {
    if (Platform.OS !== 'web' || typeof document === 'undefined' || typeof FileReader === 'undefined') {
      reject(new Error('File upload is only available on web.'));
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,text/plain';
    input.onchange = () => {
      const file = input.files?.[0];

      if (!file) {
        reject(new Error('No file selected.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    };

    input.click();
  });

export const createGeneratedCredentials = () => {
  const loginSuffix = Math.random().toString(36).slice(2, 8);
  const passwordSuffix = Math.random().toString(36).slice(2, 12);

  return {
    loginId: `player-${loginSuffix}`,
    username: `Player ${loginSuffix.slice(0, 4)}`,
    password: `gmbl-${passwordSuffix}`,
  };
};

export const downloadTextFile = (filename: string, content: string) => {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || typeof URL === 'undefined') {
    return false;
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);

  return true;
};
