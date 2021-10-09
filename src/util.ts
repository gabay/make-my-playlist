export function smallsetImage(images: any[]): any {
  return images.reduce(function (image1, image2) {
    const size1 = image1 != null ? image1.width * image1.height : Infinity;
    const size2 = image2.width * image2.height;
    return size1 < size2 ? image1 : image2;
  }, null);
}

export function randomElement<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function toggleElement<T>(array: T[], element: T): T[] {
  const index = array.indexOf(element);
  if (index > -1) {
    array.splice(index, 1);
  } else {
    array.push(element);
  }
  return array;
}

export function trim(text: string, maxLength: number): string {
  if (text.length <= maxLength) { return text; }
  const lastSpaceIndex = text.lastIndexOf(" ", maxLength + 1);
  return text.substring(0, lastSpaceIndex) + "...";
}
