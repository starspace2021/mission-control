"use client";

import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from "docx";
import { saveAs } from "file-saver";
import { Report } from "../types/report";
import { useState } from "react";

interface DownloadWordButtonProps {
  report: Report;
}

export function DownloadWordButton({ report }: DownloadWordButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    
    try {
      const date = report.time.split(" ")[0];
      const filename = `非洲情报日报_${date}.docx`;

      // 解析内容，构建文档
      const contentLines = report.content.split("\n").filter(line => line.trim());
      const children: Paragraph[] = [];

      // 标题
      children.push(
        new Paragraph({
          text: report.title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      // 时间
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `发布时间：${report.time}`,
              bold: true,
              size: 22,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      // 分隔线
      children.push(
        new Paragraph({
          border: {
            bottom: {
              color: "999999",
              space: 1,
              style: "single",
              size: 6,
            },
          },
          spacing: { after: 300 },
        })
      );

      // 内容处理
      for (const line of contentLines) {
        const trimmedLine = line.trim();
        
        if (!trimmedLine) continue;

        // 【xxx】标题
        if (trimmedLine.startsWith("【") && trimmedLine.endsWith("】")) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  bold: true,
                  size: 28,
                  color: "1a365d",
                }),
              ],
              spacing: { before: 300, after: 200 },
            })
          );
        }
        // === xxx === 分隔符
        else if (trimmedLine.startsWith("===") && trimmedLine.endsWith("===")) {
          const text = trimmedLine.replace(/===/g, "").trim();
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: text,
                  italics: true,
                  size: 22,
                  color: "666666",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
              border: {
                top: {
                  color: "cccccc",
                  space: 1,
                  style: "single",
                  size: 4,
                },
                bottom: {
                  color: "cccccc",
                  space: 1,
                  style: "single",
                  size: 4,
                },
              },
            })
          );
        }
        // 一级标题 一、xxx
        else if (/^[一二三四五六七八九十]+、/.test(trimmedLine)) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  bold: true,
                  size: 24,
                  color: "2d3748",
                }),
              ],
              spacing: { before: 250, after: 150 },
            })
          );
        }
        // 列表项 1. xxx 或 - xxx
        else if (/^\d+\./.test(trimmedLine) || trimmedLine.startsWith("- ")) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  size: 22,
                }),
              ],
              indent: { left: 360 },
              spacing: { after: 100 },
            })
          );
        }
        // 普通段落
        else {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  size: 22,
                }),
              ],
              spacing: { after: 150 },
            })
          );
        }
      }

      // 页脚
      children.push(
        new Paragraph({
          border: {
            top: {
              color: "999999",
              space: 1,
              style: "single",
              size: 6,
            },
          },
          spacing: { before: 400 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `非洲情报看板 | 生成时间：${new Date().toLocaleString("zh-CN")}`,
              size: 18,
              color: "999999",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
        })
      );

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440, // 1 inch
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, filename);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-400 bg-blue-400/10 border border-blue-400/30 rounded-lg hover:bg-blue-400/20 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {isLoading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          生成中...
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          下载Word
        </>
      )}
    </button>
  );
}
