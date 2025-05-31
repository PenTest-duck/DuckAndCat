import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";

// Dummy data for the vocabulary table
const vocabularyData = [
  { word: "안녕하세요", meaning: "Hello", difficulty: "TOPIK 1", source: "https://example.com/word1" },
  { word: "감사합니다", meaning: "Thank you", difficulty: "TOPIK 1", source: "https://example.com/word2" },
  { word: "안녕히 가세요", meaning: "Goodbye", difficulty: "TOPIK 1", source: "https://example.com/word3" },
  { word: "공부하다", meaning: "To study", difficulty: "TOPIK 2", source: "https://example.com/word4" },
  { word: "일하다", meaning: "To work", difficulty: "TOPIK 2", source: "https://example.com/word5" },
  { word: "친구", meaning: "Friend", difficulty: "TOPIK 2", source: "https://example.com/word6" },
  { word: "문화", meaning: "Culture", difficulty: "TOPIK 3", source: "https://example.com/word7" },
  { word: "역사", meaning: "History", difficulty: "TOPIK 3", source: "https://example.com/word8" },
  { word: "경제", meaning: "Economy", difficulty: "TOPIK 4", source: "https://example.com/word9" },
  { word: "정치", meaning: "Politics", difficulty: "TOPIK 4", source: "https://example.com/word10" },
  { word: "철학", meaning: "Philosophy", difficulty: "TOPIK 5", source: "https://example.com/word11" },
  { word: "심리학", meaning: "Psychology", difficulty: "TOPIK 5", source: "https://example.com/word12" },
  { word: "지속가능한 발전", meaning: "Sustainable development", difficulty: "TOPIK 6", source: "https://example.com/word13" },
  { word: "인공지능", meaning: "Artificial intelligence", difficulty: "TOPIK 6", source: "https://example.com/word14" },
];

export default function VocabularyPage() {
  return (
    <div className="container mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6">Vocabulary List</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Word (Korean)</TableHead>
              <TableHead>Meaning (English)</TableHead>
              <TableHead className="w-[100px]">Difficulty</TableHead>
              <TableHead className="w-[140px] whitespace-nowrap">Generated from</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vocabularyData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.word}</TableCell>
                <TableCell>{item.meaning}</TableCell>
                <TableCell>{item.difficulty}</TableCell>
                <TableCell>
                  <a
                    href={item.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 