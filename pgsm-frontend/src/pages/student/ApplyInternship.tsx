import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowLeft,
  Upload,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const mockInternship = {
  id: "1",
  title: "Internal Medicine Rotation",
  hospital: "CHU Mohammed VI",
  service: "Internal Medicine",
  location: "Marrakech, Morocco",
  duration: "8 weeks",
  startDate: "2025-02-01",
  endDate: "2025-04-01",
  applicationDeadline: "2025-01-15",
  tags: ["4th Year", "Required", "Clinical"],
};

export default function ApplyInternship() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    motivation: "",
    experience: "",
    availability: "",
    additionalInfo: "",
    agreeTerms: false,
  });
  
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (type: 'cv' | 'coverLetter', file: File | null) => {
    if (type === 'cv') {
      setCvFile(file);
    } else {
      setCoverLetterFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast.error(t('apply.acceptTermsError'));
      return;
    }
    
    if (!formData.motivation.trim()) {
      toast.error(t('apply.motivationRequired'));
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    toast.success(t('apply.successMessage'));
    navigate('/student/applications');
  };

  return (
    <AppLayout role="student" userName="Ahmed Benali">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/student/internships/${id}`)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </Button>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('apply.title')}</h1>
          <p className="text-muted-foreground">{t('apply.subtitle')}</p>
        </div>

        {/* Internship Summary Card */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {mockInternship.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
              <h2 className="font-semibold text-lg">{mockInternship.title}</h2>
              <p className="text-sm text-muted-foreground">{mockInternship.hospital}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {mockInternship.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {mockInternship.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {t('apply.deadline')}: {new Date(mockInternship.applicationDeadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Documents Section */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {t('apply.documents')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CV Upload */}
              <div className="space-y-2">
                <Label htmlFor="cv">{t('apply.cv')} *</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="cv"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileChange('cv', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="cv" className="cursor-pointer">
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">{cvFile.name}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{t('apply.uploadCV')}</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Cover Letter Upload */}
              <div className="space-y-2">
                <Label htmlFor="coverLetter">{t('apply.coverLetter')}</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="coverLetter"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileChange('coverLetter', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="coverLetter" className="cursor-pointer">
                    {coverLetterFile ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">{coverLetterFile.name}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{t('apply.uploadCoverLetter')}</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Motivation Section */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">{t('apply.motivationSection')}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="motivation">{t('apply.motivationLabel')} *</Label>
                <Textarea
                  id="motivation"
                  placeholder={t('apply.motivationPlaceholder')}
                  value={formData.motivation}
                  onChange={(e) => handleInputChange('motivation', e.target.value)}
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">{t('apply.experienceLabel')}</Label>
                <Textarea
                  id="experience"
                  placeholder={t('apply.experiencePlaceholder')}
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </Card>

          {/* Additional Info Section */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">{t('apply.additionalInfo')}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="availability">{t('apply.availabilityLabel')}</Label>
                <Input
                  id="availability"
                  placeholder={t('apply.availabilityPlaceholder')}
                  value={formData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">{t('apply.additionalInfoLabel')}</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder={t('apply.additionalInfoPlaceholder')}
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </Card>

          {/* Terms & Submit */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeTerms', checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                  {t('apply.termsText')}
                </label>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/student/internships/${id}`)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  disabled={isSubmitting || !formData.agreeTerms}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {t('apply.submitting')}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('apply.submitApplication')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </form>

        {/* Info Note */}
        <Card className="p-4 bg-muted/50 border-muted">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">{t('apply.noteTitle')}</p>
              <p>{t('apply.noteText')}</p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
