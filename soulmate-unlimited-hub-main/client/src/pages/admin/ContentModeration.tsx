import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, XCircle, Flag, Eye, User, Calendar, FileImage, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface PendingMedia {
  id: string;
  userId: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  compressedPath?: string;
  fileType: string;
  mimeType: string;
  originalSize: number;
  compressedSize?: number;
  compressionRatio?: string;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  isProfilePhoto: boolean;
  uploadedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface CompressionStats {
  totalFiles: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  averageCompressionRatio: number;
  totalSpaceSaved: number;
}

interface ModerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  media: PendingMedia | null;
  action: 'approve' | 'reject' | 'flag';
  onConfirm: (notes: string, reason?: string) => void;
}

const ModerationDialog = ({ isOpen, onClose, media, action, onConfirm }: ModerationDialogProps) => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(notes, reason);
    setNotes('');
    setReason('');
    onClose();
  };

  const getDialogTitle = () => {
    switch (action) {
      case 'approve': return t('moderation.dialogs.approve.title');
      case 'reject': return t('moderation.dialogs.reject.title');
      case 'flag': return t('moderation.dialogs.flag.title');
      default: return t('moderation.title');
    }
  };

  const getDialogDescription = () => {
    switch (action) {
      case 'approve': return t('moderation.dialogs.approve.description');
      case 'reject': return t('moderation.dialogs.reject.description');
      case 'flag': return t('moderation.dialogs.flag.description');
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">{getDialogTitle()}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {media && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-4 w-4 text-blue-400" />
                <span className="text-white font-medium">{media.user?.name || t('moderation.unknownUser')}</span>
                <span className="text-gray-400">({media.user?.email})</span>
              </div>
              <div className="text-sm text-gray-400">
                <p>File: {media.originalFileName}</p>
                <p>Type: {media.fileType}</p>
                <p>Size: {(media.originalSize / 1024 / 1024).toFixed(2)} MB</p>
                {media.compressedSize && (
                  <p>Compressed: {(media.compressedSize / 1024 / 1024).toFixed(2)} MB ({media.compressionRatio}% reduction)</p>
                )}
              </div>
            </div>
          )}

          {(action === 'reject' || action === 'flag') && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">{t('moderation.reason')}</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('moderation.reasonPlaceholder')}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">{t('moderation.notes')}</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('moderation.notesPlaceholder')}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-gray-700 text-white border-gray-600">
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            className={
              action === 'approve'
                ? 'bg-green-600 hover:bg-green-500'
                : action === 'reject'
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-orange-600 hover:bg-orange-500'
            }
          >
            {t(`moderation.actions.${action}`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ContentModeration = () => {
  const { t } = useTranslation();
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [compressionStats, setCompressionStats] = useState<CompressionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<PendingMedia | null>(null);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | 'flag'>('approve');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadPendingMedia = async () => {
    try {
      const response = await fetch('/api/admin/moderation/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingMedia(data);
      } else {
        console.error('Failed to load pending media');
      }
    } catch (error) {
      console.error('Error loading pending media:', error);
    }
  };

  const loadCompressionStats = async () => {
    try {
      const response = await fetch('/api/admin/compression-stats');
      if (response.ok) {
        const data = await response.json();
        setCompressionStats(data);
      } else {
        console.error('Failed to load compression stats');
      }
    } catch (error) {
      console.error('Error loading compression stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadPendingMedia(), loadCompressionStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleModerationAction = (media: PendingMedia, action: 'approve' | 'reject' | 'flag') => {
    setSelectedMedia(media);
    setModerationAction(action);
    setDialogOpen(true);
  };

  const confirmModeration = async (notes: string, reason?: string) => {
    if (!selectedMedia) return;

    try {
      const endpoint = `/api/admin/moderation/${selectedMedia.id}/${moderationAction}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, reason })
      });

      if (response.ok) {
        toast({
          title: t('common.success'),
          description: t('moderation.success', { action: moderationAction })
        });
        await loadPendingMedia();
      } else {
        toast({
          title: t('common.error'),
          description: t('moderation.failed', { action: moderationAction }),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Moderation action failed:', error);
      toast({
        title: t('common.error'),
        description: t('moderation.error'),
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">{t('moderation.title')}</h2>
          <p className="text-gray-400 mt-1">{t('admin.contentModeration.description')}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="bg-gray-700 text-white border-gray-600">
          {t('system.refresh')}
        </Button>
      </div>

      {/* Compression Statistics */}
      {compressionStats && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-400" />
              {t('admin.compressionStats.title')}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {t('admin.compressionStats.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{compressionStats.totalFiles}</div>
                <div className="text-sm text-gray-400">{t('moderation.stats.totalFiles')}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{formatFileSize(compressionStats.totalOriginalSize)}</div>
                <div className="text-sm text-gray-400">{t('moderation.stats.originalSize')}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{formatFileSize(compressionStats.totalCompressedSize)}</div>
                <div className="text-sm text-gray-400">{t('moderation.stats.compressedSize')}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{compressionStats.averageCompressionRatio}%</div>
                <div className="text-sm text-gray-400">{t('moderation.stats.avgCompression')}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{formatFileSize(compressionStats.totalSpaceSaved)}</div>
                <div className="text-sm text-gray-400">{t('moderation.stats.spaceSaved')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Content */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            {t('moderation.pending.title')} ({pendingMedia.length})
          </CardTitle>
          <CardDescription className="text-gray-400">
            {t('moderation.pending.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingMedia.length === 0 ? (
            <div className="text-center py-8">
              <FileImage className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{t('moderation.pending.noPending')}</h3>
              <p className="text-gray-400">{t('moderation.pending.allReviewed')}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingMedia.map((media) => (
                <div key={media.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* User Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {media.user?.name?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{media.user?.name || t('moderation.unknownUser')}</h3>
                          {media.isProfilePhoto && (
                            <Badge variant="secondary" className="bg-blue-600 text-white">
                              {t('moderation.profilePhoto')}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-2">{media.user?.email}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">{t('moderation.fileInfo.file')}</span>
                            <p className="text-white truncate">{media.originalFileName}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">{t('moderation.fileInfo.size')}</span>
                            <p className="text-white">{formatFileSize(media.originalSize)}</p>
                          </div>
                          {media.compressedSize && (
                            <div>
                              <span className="text-gray-400">{t('moderation.fileInfo.compressed')}</span>
                              <p className="text-green-400">{formatFileSize(media.compressedSize)}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-400">{t('moderation.fileInfo.uploaded')}</span>
                            <p className="text-white">{formatDate(media.uploadedAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleModerationAction(media, 'approve')}
                        className="bg-green-600 hover:bg-green-500 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t('moderation.actions.approve')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModerationAction(media, 'reject')}
                        className="bg-red-600 hover:bg-red-500 text-white border-red-600"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        {t('moderation.actions.reject')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModerationAction(media, 'flag')}
                        className="bg-orange-600 hover:bg-orange-500 text-white border-orange-600"
                      >
                        <Flag className="h-4 w-4 mr-1" />
                        {t('moderation.actions.flag')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Moderation Dialog */}
      <ModerationDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        media={selectedMedia}
        action={moderationAction}
        onConfirm={confirmModeration}
      />
    </div>
  );
};