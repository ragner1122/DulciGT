import { SidebarLayout } from "@/components/SidebarLayout";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useUploadHistory, useProcessUpload } from "@/hooks/use-uploads-data";
import { FileText, Loader2, CheckCircle, RefreshCcw, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Uploads() {
  const { data: uploads, isLoading } = useUploadHistory();
  const { mutate: processUpload, isPending: isProcessing } = useProcessUpload();

  return (
    <SidebarLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study Materials</h1>
          <p className="text-muted-foreground mt-1">Upload PDFs or images of practice tests to auto-convert them.</p>
        </div>
        
        <ObjectUploader
          onGetUploadParameters={async (file) => {
            const res = await fetch("/api/uploads/request-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: file.name,
                size: file.size,
                contentType: file.type,
              }),
            });
            const { uploadURL } = await res.json();
            return {
              method: "PUT",
              url: uploadURL,
              headers: { "Content-Type": file.type },
            };
          }}
          onComplete={(result) => {
            console.log("Upload complete, refreshing list...");
            // In a real app, you'd invalidate the query here or trigger the 'save metadata' endpoint
            window.location.reload(); 
          }}
          buttonClassName="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground px-6"
        >
          <span className="flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Upload New Material</span>
        </ObjectUploader>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading history...</div>
        ) : !uploads?.length ? (
          <div className="p-12 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg">No uploads yet</h3>
            <p className="text-muted-foreground max-w-sm">Upload your first practice PDF to get started with AI extraction.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border text-left">
              <tr>
                <th className="p-4 font-medium text-muted-foreground text-sm">Filename</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">Date</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">Status</th>
                <th className="p-4 font-medium text-muted-foreground text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => (
                <tr key={upload.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-accent" />
                    <span className="font-medium">{upload.filename}</span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {upload.createdAt ? format(new Date(upload.createdAt), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {upload.status === 'processed' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" /> Ready
                        </span>
                      ) : upload.status === 'processing' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          <Loader2 className="w-3 h-3 animate-spin" /> Processing
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                          Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {upload.status !== 'processed' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => processUpload(upload.id)}
                        disabled={isProcessing}
                        className="hover:text-primary"
                      >
                        <RefreshCcw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SidebarLayout>
  );
}
