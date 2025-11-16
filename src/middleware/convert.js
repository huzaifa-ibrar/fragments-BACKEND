const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

/**
 * Convert a fragment's data to another format if supported.
 * @param {Fragment} fragment - The fragment instance
 * @param {Buffer} data - Fragment data as Buffer
 * @param {string} extension - The target extension (e.g., 'html', 'txt')
 * @returns {{ convertedData: Buffer, contentType: string }}
 */
function convertFragment(fragment, data, extension) {
    console.log('🧠 convertFragment called with:', {
        type: fragment.mimeType,
        isJson: fragment.isJson,
        isMarkdown: fragment.isMarkdown,
        extension,
    });

    // If no extension provided, return original data
    if (!extension) {
        return { convertedData: data, contentType: fragment.mimeType };
    }

    const targetExt = extension.toLowerCase();

    // === MARKDOWN → HTML ===
    if (fragment.isMarkdown && targetExt === 'html') {
        try {
            const htmlContent = md.render(data.toString());
            return {
                convertedData: Buffer.from(htmlContent),
                contentType: 'text/html',
            };
        } catch (err) {
            console.error('❌ Markdown conversion error:', err);
            throw new Error(`Failed to convert Markdown to HTML: ${err.message}`);
        }
    }

    // === JSON → TEXT ===
    if (fragment.isJson && targetExt === 'txt') {
        const text = data.toString();
        try {
            // Pretty print the JSON if it's valid JSON
            let parsedData;
            try {
                parsedData = JSON.parse(text);
            } catch {
                // If parsing fails, use the raw text
                parsedData = text;
            }

            const prettyText = typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData, null, 2);
            return {
                convertedData: Buffer.from(prettyText),
                contentType: 'text/plain',
            };
        } catch (err) {
            // If all conversion attempts fail, return raw text
            return {
                convertedData: Buffer.from(text),
                contentType: 'text/plain',
            };
        }
    }

    // === Unsupported conversion ===
    console.warn(
        `⚠️ Unsupported conversion requested: ${fragment.mimeType} → ${targetExt}`
    );
    throw new Error(`Unsupported conversion: ${fragment.mimeType} to ${targetExt}`);
}

module.exports = convertFragment;
