export const joinWithAnd = (strings: string[]): string => {
  if (strings.length === 0) {
    return ""
  } else if (strings.length === 1) {
    return strings[0]
  }
  const last = strings.pop();
  return strings.join(', ') + ' and ' + last;
}