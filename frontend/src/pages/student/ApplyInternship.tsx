import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  ClipboardCheck,
  GraduationCap,
  User,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { documentService, Document } from "@/services/document.service";
import { applicationService } from "@/services/application.service";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { offerService, Offer } from "@/services/offer.service";

const steps = [
  { id: 1, title: "Prerequisites", icon: ClipboardCheck },
  { id: 2, title: "Documents", icon: FileText },
  { id: 3, title: "Motivation", icon: GraduationCap },
  { id: 4, title: "Review", icon: CheckCircle2 },
];

export default function ApplyInternship() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    motivation: "",
    experience: "",
    availability: "",
    additionalInfo: "",
    agreeTerms: false,
    acknowledgePrerequisites: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileDocuments, setProfileDocuments] = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [offerLoading, setOfferLoading] = useState(true);
  const [offerError, setOfferError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch internship offer details
    const fetchOffer = async () => {
      if (!id) return;
      try {
        setOfferLoading(true);
        setOfferError(null);
        const res = await offerService.getOfferById(id);
        if (res.success && res.data) {
          setOffer(res.data);
        } else {
          setOfferError(res.message || "Offer not found");
        }
      } catch (err: any) {
        setOfferError(err.response?.data?.message || err.message || t("common.error"));
      } finally {
        setOfferLoading(false);
      }
    };

    fetchOffer();

    // Fetch profile documents
    const fetchDocs = async () => {
      try {
        setDocsLoading(true);
        const res = await documentService.getProfileDocuments();
        if (res.success) {
          setProfileDocuments(res.data || []);
        }
      } catch (err: any) {
        setDocsError(err.response?.data?.message || err.message || "Failed to load profile documents");
      } finally {
        setDocsLoading(false);
      }
    };

    fetchDocs();
  }, [id, t]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const hasRequiredProfileDocs = profileDocuments.some(d => d.type === 'cv') &&
    profileDocuments.some(d => d.type === 'transcript');

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.acknowledgePrerequisites;
      case 2:
        return hasRequiredProfileDocs;
      case 3:
        return formData.motivation.trim().length >= 50;
      case 4:
        return formData.agreeTerms;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (canProceedFromStep(currentStep) && currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else if (!canProceedFromStep(currentStep)) {
      toast.error(getStepError(currentStep));
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getStepError = (step: number): string => {
    switch (step) {
      case 1:
        return "Please acknowledge the prerequisites to continue";
      case 2:
        return "Please upload required documents (CV and transcript) to your profile";
      case 3:
        return "Motivation letter must be at least 50 characters";
      case 4:
        return "Please accept the terms and conditions";
      default:
        return "Please complete all required fields";
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

    if (!id) {
      toast.error(t('common.error'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await applicationService.createApplication({
        offer_id: id,
        motivation: formData.motivation.trim(),
        experience: formData.experience || undefined,
        availability_date: formData.availability || undefined,
      });

      if (response.success) {
        toast.success(t('apply.successMessage'));
        navigate('/student/applications');
      } else {
        toast.error(response.message || t('common.error'));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / 4) * 100;

  if (offerLoading) {
    return (
      <AppLayout role="student">
        <LoadingState message={t("common.loading")} />
      </AppLayout>
    );
  }

  if (offerError || !offer) {
    return (
      <AppLayout role="student">
        <ErrorState message={offerError || t("common.error")} onRetry={() => window.location.reload()} />
      </AppLayout>
    );
  }

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

        {/* Progress Steps */}
        <Card className="p-4">
          <div className="mb-4">
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <div className="flex justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center gap-2 flex-1",
                    isActive && "text-primary",
                    isCompleted && "text-success",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    isActive && "border-primary bg-primary/10",
                    isCompleted && "border-success bg-success/10",
                    !isActive && !isCompleted && "border-muted"
                  )}>
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Internship Summary Card */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {offer.type && (
                  <Badge variant="secondary" className="text-xs">{offer.type}</Badge>
                )}
                {offer.department && (
                  <Badge variant="secondary" className="text-xs">{offer.department}</Badge>
                )}
              </div>
              <h2 className="font-semibold text-lg">{offer.title}</h2>
              <p className="text-sm text-muted-foreground">{offer.hospital_name}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {offer.hospital_city}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {offer.duration_weeks ? `${offer.duration_weeks} weeks` : undefined}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {offer.application_deadline && (
                    <>
                      {t('apply.deadline')}: {new Date(offer.application_deadline).toLocaleDateString()}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Prerequisites */}
          {currentStep === 1 && (
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                Prerequisites Check
              </h3>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please verify that you meet all the prerequisites for this internship:
                </p>

                <div className="space-y-3">
                  {offer.requirements
                    ? offer.requirements.split("\n").map((line, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-muted/40"
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm text-foreground">
                          {line}
                        </span>
                      </div>
                    ))
                    : (
                      <p className="text-sm text-muted-foreground">
                        No specific prerequisites listed for this internship.
                      </p>
                    )}
                </div>

                <Separator />

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acknowledgePrerequisites"
                    checked={formData.acknowledgePrerequisites}
                    onCheckedChange={(checked) => handleInputChange('acknowledgePrerequisites', checked as boolean)}
                  />
                  <label
                    htmlFor="acknowledgePrerequisites"
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    I acknowledge that I have reviewed the prerequisites and understand the requirements for this internship.
                  </label>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Documents (profile-level) */}
          {currentStep === 2 && (
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {t('apply.documents')}
              </h3>
              {docsLoading ? (
                <div className="py-4">
                  <LoadingState message={t('common.loading')} />
                </div>
              ) : docsError ? (
                <div className="py-4">
                  <ErrorState message={docsError} onRetry={() => window.location.reload()} />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      These documents are uploaded in your profile and will be reused for this application.
                    </p>
                    <div className="space-y-2">
                      {['cv', 'transcript', 'id_card', 'insurance', 'certificate', 'other'].map((type) => {
                        const docsOfType = profileDocuments.filter(d => d.type === type);
                        const isRequired = type === 'cv' || type === 'transcript';

                        // Do not render rows for types without any uploaded documents
                        if (docsOfType.length === 0) {
                          return null;
                        }

                        const label = type === 'cv'
                          ? t('apply.cv')
                          : type === 'transcript'
                            ? t('apply.transcript', 'Academic Transcript')
                            : type === 'id_card'
                              ? t('apply.idCard', 'ID Card')
                              : type === 'insurance'
                                ? t('apply.insurance', 'Insurance Certificate')
                                : type === 'certificate'
                                  ? t('apply.certificates', 'Other Certificates')
                                  : t('apply.otherDocuments', 'Other Documents');

                        return (
                          <div key={type} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-primary mt-0.5" />
                              <div>
                                <p className="text-sm font-medium flex items-center gap-2">
                                  {label}
                                  {isRequired && <span className="text-xs text-destructive">{t('common.required')}</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {docsOfType[0].name}
                                </p>
                              </div>
                            </div>
                            {isRequired && (
                              <Badge variant="success" className="text-xs">
                                {t('common.completed')}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {!hasRequiredProfileDocs && (
                    <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                      <p className="text-sm text-warning flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {t('apply.missingProfileDocuments', 'Please upload your CV and academic transcript in your profile before applying.')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </Card>
          )}

          {/* Step 3: Motivation */}
          {currentStep === 3 && (
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                {t('apply.motivationSection')}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="motivation">
                    {t('apply.motivationLabel')} <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="motivation"
                    placeholder={t('apply.motivationPlaceholder')}
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    className="min-h-[150px]"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.motivation.length}/500 characters (minimum 50)
                  </p>
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

                <div className="space-y-2">
                  <Label htmlFor="availability">{t('apply.availabilityLabel')}</Label>
                  <Input
                    id="availability"
                    type="date"
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
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <>
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Review Your Application
                </h3>

                <div className="space-y-4">
                  {/* Documents Summary */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {t('apply.documents')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {hasRequiredProfileDocs
                        ? t('apply.profileDocumentsReady', 'Your profile documents (CV and transcript) will be attached to this application.')
                        : t('apply.missingProfileDocumentsShort', 'Required profile documents are missing (CV and/or transcript).')}
                    </p>
                  </div>

                  {/* Motivation Summary */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Motivation Letter
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {formData.motivation || "No motivation letter provided"}
                    </p>
                  </div>

                  {/* Experience Summary */}
                  {formData.experience && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Relevant Experience
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {formData.experience}
                      </p>
                    </div>
                  )}
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
                </div>
              </Card>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? () => navigate(`/student/internships/${id}`) : prevStep}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 1 ? t('common.cancel') : 'Previous'}
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                variant="hero"
                onClick={nextStep}
                disabled={!canProceedFromStep(currentStep)}
                className="gap-2"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
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
            )}
          </div>
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
