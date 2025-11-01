
import { Camera, Book, Coffee, Star } from "lucide-react";

export const getInterestIcon = (interest: string) => {
  const lowerInterest = interest.toLowerCase();
  if (lowerInterest.includes('foto') || lowerInterest.includes('camera')) return Camera;
  if (lowerInterest.includes('bok') || lowerInterest.includes('läs')) return Book;
  if (lowerInterest.includes('kaffe') || lowerInterest.includes('coffee')) return Coffee;
  return Star;
};
