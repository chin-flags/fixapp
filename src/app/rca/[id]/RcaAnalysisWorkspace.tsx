"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BrainstormingContribution = {
  id: string;
  title?: string | null;
  content: string;
  createdAt: string;
  author: {
    name: string;
  };
};

type FishboneCause = {
  id: string;
  category: string;
  cause: string;
  createdAt: string;
};

type RcaSolution = {
  id: string;
  description: string;
  status: string;
  dueDate?: string | null;
};

type Evidence = {
  id: string;
  text: string;
  files?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
};

type AnalysisSolution = {
  id: string;
  text: string;
  cost: number;
  urgency: number;
};

type AnalysisNode = {
  id: string;
  text: string;
  evidences: Evidence[];
  solutions: AnalysisSolution[];
  children: AnalysisNode[];
};

type WorkspaceProps = {
  title: string;
  description: string;
  fishbones: FishboneCause[];
  brainstormingContributions: BrainstormingContribution[];
  solutions: RcaSolution[];
  openDiagramHref?: string;
  isExpanded?: boolean;
};

type AnalysisNodeProps = {
  node: AnalysisNode;
  depth: number;
  onAddChild: (parentId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdateText: (nodeId: string, text: string) => void;
  onAddEvidence: (
    nodeId: string,
    evidence: {
      text: string;
      files: {
        name: string;
        url: string;
        type: string;
      }[];
    },
  ) => void;
  onUpdateEvidence: (nodeId: string, evidenceId: string, text: string) => void;
  onDeleteEvidence: (nodeId: string, evidenceId: string) => void;
  onAddSolution: (nodeId: string) => void;
  onUpdateSolutionText: (nodeId: string, solutionId: string, text: string) => void;
  onDeleteSolution: (nodeId: string, solutionId: string) => void;
};

type SolutionPoint = AnalysisSolution & {
  nodeId: string;
  nodeText: string;
  level: number;
};

const tabOptions = [
  { id: "fishbone", label: "Cause Map" },
  { id: "matrix", label: "Priority Matrix" },
  { id: "finder", label: "Solution Finder" },
] as const;

type TabId = (typeof tabOptions)[number]["id"];

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function inferUrgency(solution: RcaSolution) {
  if (solution.status === "blocked") {
    return 82;
  }
  if (solution.status === "in_progress") {
    return 72;
  }
  if (solution.status === "pending") {
    return 64;
  }
  if (solution.status === "completed") {
    return 38;
  }
  if (solution.status === "approved") {
    return 24;
  }
  return 50;
}

function buildInitialTree({
  title,
  description,
  fishbones,
  brainstormingContributions,
  solutions,
}: WorkspaceProps): AnalysisNode {
  const groupedFishbones = fishbones.reduce<Map<string, FishboneCause[]>>((acc, item) => {
    const key = item.category?.trim() || "Other";
    const current = acc.get(key) ?? [];
    current.push(item);
    acc.set(key, current);
    return acc;
  }, new Map());

  return {
    id: createId("root"),
    text: title || description || "RCA problem statement",
    evidences: brainstormingContributions.slice(0, 6).map((item) => ({
      id: item.id,
      text: `${item.title ? `${item.title}: ` : ""}${item.content}`,
    })),
    solutions: solutions.map((solution) => ({
      id: solution.id,
      text: solution.description,
      cost: 50,
      urgency: inferUrgency(solution),
    })),
    children:
      groupedFishbones.size > 0
        ? [...groupedFishbones.entries()].map(([category, causes]) => ({
            id: createId("cat"),
            text: category,
            evidences: [],
            solutions: [],
            children: causes.map((cause) => ({
              id: cause.id,
              text: cause.cause,
              evidences: [],
              solutions: [],
              children: [],
            })),
          }))
        : [
            {
              id: createId("why"),
              text: description || "Describe the primary contributing cause.",
              evidences: [],
              solutions: [],
              children: [],
            },
          ],
  };
}

function treeMap(node: AnalysisNode, update: (node: AnalysisNode) => AnalysisNode): AnalysisNode {
  const next = update(node);
  return {
    ...next,
    children: next.children.map((child) => treeMap(child, update)),
  };
}

function deleteNode(node: AnalysisNode, nodeId: string): AnalysisNode {
  return {
    ...node,
    children: node.children
      .filter((child) => child.id !== nodeId)
      .map((child) => deleteNode(child, nodeId)),
  };
}

function flattenSolutions(node: AnalysisNode, level = 0): SolutionPoint[] {
  return [
    ...node.solutions.map((solution) => ({
      ...solution,
      nodeId: node.id,
      nodeText: node.text,
      level,
    })),
    ...node.children.flatMap((child) => flattenSolutions(child, level + 1)),
  ];
}

function getQuadrant(solution: { cost: number; urgency: number }) {
  if (solution.cost <= 50 && solution.urgency > 50) {
    return {
      label: "Quick Wins",
      className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };
  }
  if (solution.cost > 50 && solution.urgency > 50) {
    return {
      label: "Strategic",
      className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    };
  }
  if (solution.cost <= 50 && solution.urgency <= 50) {
    return {
      label: "Defer",
      className: "border-border bg-muted text-muted-foreground",
    };
  }
  return {
    label: "Reconsider",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  };
}

function AnalysisNodeCard({
  node,
  depth,
  onAddChild,
  onDelete,
  onUpdateText,
  onAddEvidence,
  onUpdateEvidence,
  onDeleteEvidence,
  onAddSolution,
  onUpdateSolutionText,
  onDeleteSolution,
}: AnalysisNodeProps) {
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [draftEvidenceText, setDraftEvidenceText] = useState("");
  const [draftFiles, setDraftFiles] = useState<
    {
      id: string;
      name: string;
      url: string;
      type: string;
    }[]
  >([]);

  const resetEvidenceModal = () => {
    setDraftEvidenceText("");
    setDraftFiles([]);
    setIsEvidenceModalOpen(false);
  };

  const onPickEvidenceFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const nextFiles = await Promise.all(
      files.map(
        (file) =>
          new Promise<{
            id: string;
            name: string;
            url: string;
            type: string;
          }>((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                id: createId("file"),
                name: file.name,
                url: typeof reader.result === "string" ? reader.result : "",
                type: file.type || "application/octet-stream",
              });
            reader.readAsDataURL(file);
          }),
      ),
    );

    setDraftFiles((current) => [...current, ...nextFiles]);
    event.target.value = "";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-sm space-y-2">
        {node.solutions.length ? (
          <div className="space-y-2">
            {node.solutions.map((solution) => (
              <div
                key={solution.id}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <textarea
                    value={solution.text}
                    onChange={(event) =>
                      onUpdateSolutionText(node.id, solution.id, event.target.value)
                    }
                    rows={2}
                    className="min-h-12 flex-1 resize-none bg-transparent text-foreground outline-none"
                  />
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => onDeleteSolution(node.id, solution.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-2 flex gap-2 text-[11px] text-muted-foreground">
                  <span>Cost {solution.cost}</span>
                  <span>Urgency {solution.urgency}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            "rounded-xl border bg-card p-4 shadow-sm",
            depth === 0 ? "border-primary/40 shadow-md" : "border-border",
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {depth === 0 ? "Problem Statement" : `Why Level ${depth}`}
          </p>
          <textarea
            value={node.text}
            onChange={(event) => onUpdateText(node.id, event.target.value)}
            rows={2}
            className="mt-2 min-h-16 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
            placeholder={depth === 0 ? "Describe the issue..." : "Why did this happen?"}
          />

          <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => onAddChild(node.id)}>
              Add Why
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEvidenceModalOpen(true)}>
              Add Evidence
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onAddSolution(node.id)}>
              Add Solution
            </Button>
            {depth > 0 ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(node.id)}>
                Delete
              </Button>
            ) : null}
          </div>
        </div>

        {node.evidences.length ? (
          <div className="space-y-2">
            {node.evidences.map((evidence) => (
              <div
                key={evidence.id}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm"
              >
                <textarea
                  value={evidence.text}
                  onChange={(event) =>
                    onUpdateEvidence(node.id, evidence.id, event.target.value)
                  }
                  rows={2}
                  className="min-h-12 w-full resize-none bg-transparent text-foreground outline-none"
                />
                {evidence.files?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {evidence.files.map((file) => (
                      <a
                        key={file.id}
                        href={file.url}
                        download={file.name}
                        className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground hover:bg-muted"
                      >
                        {file.type.startsWith("image/") ? "Image" : "File"}: {file.name}
                      </a>
                    ))}
                  </div>
                ) : null}
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => onDeleteEvidence(node.id, evidence.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {isEvidenceModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Add Evidence</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Capture notes and attach supporting files for this cause.
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={resetEvidenceModal}
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <textarea
                  value={draftEvidenceText}
                  onChange={(event) => setDraftEvidenceText(event.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                  placeholder="Describe the evidence..."
                />

                <div>
                  <label className="block text-sm font-medium text-foreground" htmlFor={`evidence-files-${node.id}`}>
                    Files
                  </label>
                  <input
                    id={`evidence-files-${node.id}`}
                    type="file"
                    multiple
                    className="mt-1 block w-full text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
                    onChange={onPickEvidenceFiles}
                  />
                </div>

                {draftFiles.length ? (
                  <div className="space-y-2">
                    {draftFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                      >
                        <span className="truncate text-foreground">{file.name}</span>
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            setDraftFiles((current) => current.filter((currentFile) => currentFile.id !== file.id))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={resetEvidenceModal}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    onAddEvidence(node.id, {
                      text: draftEvidenceText.trim() || "New evidence",
                      files: draftFiles.map((file) => ({
                        name: file.name,
                        url: file.url,
                        type: file.type,
                      })),
                    });
                    resetEvidenceModal();
                  }}
                >
                  Add Evidence
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {node.children.length ? <div className="h-6 w-px bg-border" /> : null}

      {node.children.length ? (
        <div className="flex flex-wrap justify-center gap-6">
          {node.children.map((child) => (
            <AnalysisNodeCard
              key={child.id}
              node={child}
              depth={depth + 1}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onUpdateText={onUpdateText}
              onAddEvidence={onAddEvidence}
              onUpdateEvidence={onUpdateEvidence}
              onDeleteEvidence={onDeleteEvidence}
              onAddSolution={onAddSolution}
              onUpdateSolutionText={onUpdateSolutionText}
              onDeleteSolution={onDeleteSolution}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PriorityMatrix({
  solutions,
  onMoveSolution,
}: {
  solutions: SolutionPoint[];
  onMoveSolution: (solutionId: string, cost: number, urgency: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    if (!draggingId) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const cost = clamp(((event.clientX - rect.left) / rect.width) * 100);
      const urgency = clamp((1 - (event.clientY - rect.top) / rect.height) * 100);
      onMoveSolution(draggingId, cost, urgency);
    };

    const handlePointerUp = () => {
      setDraggingId(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggingId, onMoveSolution]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div
          ref={containerRef}
          className="relative h-[420px] overflow-hidden rounded-lg border border-border bg-background"
        >
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="border-b border-r border-border bg-emerald-500/10 p-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
              Quick Wins
            </div>
            <div className="border-b border-border bg-amber-500/10 p-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
              Strategic
            </div>
            <div className="border-r border-border bg-muted/50 p-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Defer
            </div>
            <div className="bg-rose-500/10 p-3 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700 dark:text-rose-300">
              Reconsider
            </div>
          </div>

          {solutions.map((solution) => (
            <button
              key={solution.id}
              type="button"
              onPointerDown={() => setDraggingId(solution.id)}
              className="absolute z-10 h-5 w-5 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-background bg-primary shadow"
              style={{
                left: `${solution.cost}%`,
                bottom: `${solution.urgency}%`,
              }}
              title={solution.text}
            />
          ))}

          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center text-xs font-medium text-muted-foreground">
            Cost / Effort
          </div>
          <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-muted-foreground">
            Urgency / Impact
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {solutions.length ? (
          solutions.map((solution) => (
            <div
              key={solution.id}
              className="flex flex-col gap-2 rounded-lg border border-border p-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{solution.text}</p>
                <p className="text-xs text-muted-foreground">
                  From: {solution.nodeText || "Unassigned cause"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline">{getQuadrant(solution).label}</Badge>
                <div className="text-xs text-muted-foreground">Cost {solution.cost}</div>
                <div className="text-xs text-muted-foreground">Urgency {solution.urgency}</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Add solutions in the Cause Map tab to populate the matrix.
          </p>
        )}
      </div>
    </div>
  );
}

export default function RcaAnalysisWorkspace(props: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabId>("fishbone");
  const [tree, setTree] = useState<AnalysisNode>(() => buildInitialTree(props));

  const allSolutions = useMemo(() => flattenSolutions(tree), [tree]);
  const rankedSolutions = useMemo(
    () =>
      [...allSolutions].sort((left, right) => right.urgency - left.urgency || left.cost - right.cost),
    [allSolutions],
  );

  const content = (
    <>
      <div className="flex flex-wrap gap-2">
        {tabOptions.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "fishbone" ? (
        <div className="space-y-4">
          {!props.isExpanded ? (
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              This workspace is interactive in-page. Tree edits and matrix moves here are local until RCA tree persistence is migrated in this app.
            </div>
          ) : null}
          <div className={cn("overflow-x-auto rounded-xl border border-border bg-muted/20", props.isExpanded ? "p-3" : "p-6")}>
            <div className="min-w-max">
              <AnalysisNodeCard
                node={tree}
                depth={0}
                onAddChild={(parentId) =>
                  setTree((current) =>
                    treeMap(current, (node) =>
                      node.id === parentId
                        ? {
                            ...node,
                            children: [
                              ...node.children,
                              {
                                id: createId("why"),
                                text: "New cause",
                                evidences: [],
                                solutions: [],
                                children: [],
                              },
                            ],
                          }
                        : node,
                    ),
                  )
                }
                onDelete={(nodeId) => setTree((current) => deleteNode(current, nodeId))}
                onUpdateText={(nodeId, text) =>
                  setTree((current) =>
                    treeMap(current, (node) => (node.id === nodeId ? { ...node, text } : node)),
                  )
                }
                onAddEvidence={(nodeId, evidence) =>
                  setTree((current) =>
                    treeMap(current, (node) =>
                      node.id === nodeId
                        ? {
                            ...node,
                            evidences: [
                              ...node.evidences,
                              {
                                id: createId("evidence"),
                                text: evidence.text,
                                files: evidence.files.map((file) => ({
                                  id: createId("file"),
                                  name: file.name,
                                  url: file.url,
                                  type: file.type,
                                })),
                              },
                            ],
                          }
                        : node,
                    ),
                  )
                }
                onUpdateEvidence={(nodeId, evidenceId, text) =>
                  setTree((current) =>
                    treeMap(current, (node) =>
                      node.id === nodeId
                        ? {
                            ...node,
                            evidences: node.evidences.map((evidence) =>
                              evidence.id === evidenceId ? { ...evidence, text } : evidence,
                            ),
                          }
                        : node,
                    ),
                  )
                }
                onDeleteEvidence={(nodeId, evidenceId) =>
                  setTree((current) =>
                    treeMap(current, (node) =>
                      node.id === nodeId
                        ? {
                            ...node,
                            evidences: node.evidences.filter((evidence) => evidence.id !== evidenceId),
                          }
                        : node,
                    ),
                  )
                }
                onAddSolution={(nodeId) =>
                  setTree((current) =>
                    treeMap(current, (node) =>
                      node.id === nodeId
                        ? {
                            ...node,
                            solutions: [
                              ...node.solutions,
                              {
                                id: createId("solution"),
                                text: "New solution",
                                cost: 50,
                                urgency: 50,
                              },
                            ],
                          }
                        : node,
                    ),
                  )
                }
                onUpdateSolutionText={(nodeId, solutionId, text) =>
                  setTree((current) =>
                    treeMap(current, (node) =>
                      node.id === nodeId
                        ? {
                            ...node,
                            solutions: node.solutions.map((solution) =>
                              solution.id === solutionId ? { ...solution, text } : solution,
                            ),
                          }
                        : node,
                    ),
                  )
                }
                onDeleteSolution={(nodeId, solutionId) =>
                  setTree((current) =>
                    treeMap(current, (node) =>
                      node.id === nodeId
                        ? {
                            ...node,
                            solutions: node.solutions.filter((solution) => solution.id !== solutionId),
                          }
                        : node,
                    ),
                  )
                }
              />
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "matrix" ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Drag each solution point to tune cost and urgency. Quick wins rise to the top of the finder automatically.
          </p>
          <PriorityMatrix
            solutions={allSolutions}
            onMoveSolution={(solutionId, cost, urgency) =>
              setTree((current) =>
                treeMap(current, (node) => ({
                  ...node,
                  solutions: node.solutions.map((solution) =>
                    solution.id === solutionId ? { ...solution, cost, urgency } : solution,
                  ),
                })),
              )
            }
          />
        </div>
      ) : null}

      {activeTab === "finder" ? (
        <div className="space-y-4">
          {rankedSolutions.length ? (
            rankedSolutions.map((solution, index) => {
              const quadrant = getQuadrant(solution);
              return (
                <div
                  key={solution.id}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <Badge className={quadrant.className}>{quadrant.label}</Badge>
                      </div>
                      <p className="font-medium text-foreground">{solution.text}</p>
                      <p className="text-sm text-muted-foreground">
                        Tied to: {solution.nodeText || "Unassigned cause"}
                      </p>
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <span>Cost {solution.cost}</span>
                      <span>Urgency {solution.urgency}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
              No solutions available yet. Add them from the Cause Map view.
            </div>
          )}
        </div>
      ) : null}
    </>
  );

  if (props.isExpanded) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Cause Map Workspace</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Interactive cause mapping, solution finder, and priority matrix based on this RCA record.
            </p>
          </div>
          <Badge variant="outline">Full Page</Badge>
        </div>
        {content}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Cause Map Workspace</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Interactive cause mapping, solution finder, and priority matrix based on this RCA record.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{props.isExpanded ? "Full Page" : "Interactive"}</Badge>
            {props.openDiagramHref ? (
              <Button asChild variant="outline" size="sm">
                <Link href={props.openDiagramHref}>Open Full Page</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">{content}</CardContent>
    </Card>
  );
}
