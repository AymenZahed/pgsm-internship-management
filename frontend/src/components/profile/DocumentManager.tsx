import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { documentService, Document, ProfileDocumentType } from "@/services/document.service";
import { toast } from "sonner";
import { FileText, Upload, Trash2, CheckCircle2, XCircle, Plus } from "lucide-react";

interface DocumentManagerProps {
    readOnly?: boolean;
}

export function DocumentManager({ readOnly }: DocumentManagerProps) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<Record<ProfileDocumentType, File | null>>({
        cv: null,
        transcript: null,
        id_card: null,
        insurance: null,
        certificate: null,
        other: null,
    });
    const [selectedNames, setSelectedNames] = useState<Record<ProfileDocumentType, string>>({
        cv: "",
        transcript: "",
        id_card: "",
        insurance: "",
        certificate: "",
        other: "",
    });

    const requiredTypes: ProfileDocumentType[] = ["cv", "transcript"];

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await documentService.getProfileDocuments();
            if (res.success) {
                setDocuments(res.data || []);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileChange = (type: ProfileDocumentType, file: File | null) => {
        setSelectedFiles((prev) => ({ ...prev, [type]: file }));
    };

    const handleUpload = async (type: ProfileDocumentType, fileOverride?: File) => {
        const file = fileOverride || selectedFiles[type];
        if (!file) {
            toast.error("Please select a file to upload");
            return;
        }

        const customName = selectedNames[type]?.trim();
        if (!customName) {
            toast.error("Please enter a document name");
            return;
        }

        if (file.type !== "application/pdf") {
            toast.error("Only PDF files are allowed");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        try {
            setUploading(true);
            const res = await documentService.uploadProfileDocument(file, type, customName);
            if (res.success) {
                toast.success("Document uploaded successfully");
                setSelectedFiles((prev) => ({ ...prev, [type]: null }));
                setSelectedNames((prev) => ({ ...prev, [type]: "" }));
                await fetchDocuments();
            } else {
                toast.error(res.message || "Failed to upload document");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to upload document");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await documentService.deleteProfileDocument(id);
            if (res.success) {
                toast.success("Document deleted successfully");
                setDocuments((prev) => prev.filter((d) => d.id !== id));
            } else {
                toast.error(res.message || "Failed to delete document");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete document");
        }
    };

    const hasDocumentOfType = (type: ProfileDocumentType) =>
        documents.some((d) => d.type === type);

    const getLatestDocumentOfType = (type: ProfileDocumentType) =>
        documents.find((d) => d.type === type);

    const getDocumentsOfType = (type: ProfileDocumentType) =>
        documents.filter((d) => d.type === type);

    const fileInputsRef = useRef<Record<ProfileDocumentType, HTMLInputElement | null>>({
        cv: null,
        transcript: null,
        id_card: null,
        insurance: null,
        certificate: null,
        other: null,
    });

    const renderStatusBadge = (doc?: Document) => {
        if (!doc) return null;
        if (doc.status === "verified") {
            return (
                <Badge variant="outline" className="gap-1 text-green-600 border-green-300">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                </Badge>
            );
        }
        if (doc.status === "rejected") {
            return (
                <Badge variant="outline" className="gap-1 text-red-600 border-red-300">
                    <XCircle className="w-3 h-3" /> Rejected
                </Badge>
            );
        }
        return <Badge variant="outline">Pending verification</Badge>;
    };

    if (loading) {
        return <LoadingState message="Loading documents..." />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={fetchDocuments} />;
    }

    const completionCount = requiredTypes.filter((t) => hasDocumentOfType(t)).length;

    return (
        <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-lg">Required Documents</h3>
                    <p className="text-sm text-muted-foreground">
                        Upload your CV and academic transcript once. They will be reused for all applications.
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    {completionCount}/{requiredTypes.length} required documents uploaded
                </div>
            </div>

            {/* Fixed single-document cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([
                    ["cv", "Curriculum Vitae (CV)"],
                    ["transcript", "Academic Transcript"],
                    ["id_card", "ID Card"],
                    ["insurance", "Insurance Certificate"],
                ] as [ProfileDocumentType, string][]).map(([type, label]) => {
                    const doc = getLatestDocumentOfType(type);
                    const isRequired = requiredTypes.includes(type);

                    return (
                        <div key={type} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <div>
                                        <p className="font-medium text-sm">{label}</p>
                                        {isRequired && (
                                            <p className="text-xs text-destructive">Required</p>
                                        )}
                                    </div>
                                </div>
                                {renderStatusBadge(doc)}
                            </div>

                            {doc ? (
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="truncate flex-1 mr-2">{doc.name}</span>
                                    {!readOnly && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive"
                                            onClick={() => handleDelete(doc.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    No document uploaded yet.
                                </p>
                            )}

                            {!readOnly && (
                                <div className="space-y-2 mt-1">
                                    <Input
                                        type="text"
                                        placeholder="Document name (e.g., CV 2025)"
                                        className="h-8 text-xs"
                                        value={selectedNames[type]}
                                        onChange={(e) =>
                                            setSelectedNames((prev) => ({
                                                ...prev,
                                                [type]: e.target.value,
                                            }))
                                        }
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            ref={(el) => {
                                                fileInputsRef.current[type] = el;
                                            }}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                if (!file) return;
                                                handleFileChange(type, file);
                                                handleUpload(type, file);
                                                e.target.value = "";
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8"
                                            disabled={uploading}
                                            onClick={() => fileInputsRef.current[type]?.click()}
                                        >
                                            <Upload className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Multiple other certificates */}
            <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <div>
                            <p className="font-semibold text-sm">Other Certificates</p>
                            <p className="text-xs text-muted-foreground">
                                Upload as many additional certificates as you need.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                    {getDocumentsOfType("certificate").length > 0 ? (
                        getDocumentsOfType("certificate").map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between bg-muted/50 rounded px-2 py-1"
                            >
                                <span className="truncate flex-1 mr-2">{doc.name}</span>
                                {!readOnly && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive"
                                        onClick={() => handleDelete(doc.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            No certificate uploaded yet.
                        </p>
                    )}
                </div>

                {!readOnly && (
                    <div className="space-y-2 mt-1">
                        <Input
                            type="text"
                            placeholder="Certificate name (e.g., BLS 2024)"
                            className="h-8 text-xs"
                            value={selectedNames.certificate}
                            onChange={(e) =>
                                setSelectedNames((prev) => ({
                                    ...prev,
                                    certificate: e.target.value,
                                }))
                            }
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                ref={(el) => {
                                    fileInputsRef.current.certificate = el;
                                }}
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (!file) return;
                                    handleFileChange("certificate", file);
                                    handleUpload("certificate", file);
                                    e.target.value = "";
                                }}
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                disabled={uploading}
                                onClick={() => fileInputsRef.current.certificate?.click()}
                                aria-label="Add certificate"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
