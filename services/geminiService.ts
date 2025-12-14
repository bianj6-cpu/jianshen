/**
 * Client-side service that calls the Backend API.
 * NO API KEY is required here.
 */

export const deduceActionFromCourse = async (courseName: string): Promise<string> => {
  try {
    const response = await fetch('/api/generate-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseName }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to fetch action');
    }

    const data = await response.json();
    return data.action || "自信摆姿势";

  } catch (error) {
    console.error("Action Deduction Error:", error);
    // Fallback logic handled in UI or here
    return "进行健身训练";
  }
};

export const generateImageFromPrompt = async (prompt: string): Promise<string | null> => {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to generate image');
    }

    const data = await response.json();
    return data.imageUrl;

  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error; // Throw so UI can capture it
  }
};