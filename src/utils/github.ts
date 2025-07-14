export const extractOwnerAndRepo = (url: string): { owner: string; repo: string } | null => {
    try {
      const cleanUrl = url.replace(/\.git$/, '');
      const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/|$)/);
      if (!match) return null;
      return { owner: match[1], repo: match[2] };
    } catch {
      return null;
    }
  };
  