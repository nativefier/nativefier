export function extractBoolean(
  infoPlistXML: string,
  plistKey: string,
): boolean | undefined {
  const plistValue = extractRaw(infoPlistXML, plistKey);

  return plistValue === undefined
    ? undefined
    : plistValue.split('<')[1].split('/>')[0].toLowerCase() === 'true';
}

export function extractString(
  infoPlistXML: string,
  plistKey: string,
): string | undefined {
  const plistValue = extractRaw(infoPlistXML, plistKey);

  return plistValue === undefined
    ? undefined
    : plistValue.split('<string>')[1].split('</string>')[0];
}

function extractRaw(
  infoPlistXML: string,
  plistKey: string,
): string | undefined {
  // This would be easier with xml2js, but let's not add a dependency for something this minor.
  const fullKey = `\n    <key>${plistKey}</key>`;

  if (infoPlistXML.indexOf(fullKey) === -1) {
    // This value wasn't set, so we'll stay agnostic to it
    return undefined;
  }

  return infoPlistXML
    .split(fullKey)[1]
    .split('\n  </dict>')[0] // Get everything between here and the end of the main plist dict
    .split('\n    <key>')[0]; // Get everything before the next key (if it exists)
}
