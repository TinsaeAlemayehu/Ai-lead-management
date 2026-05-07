import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { leadService } from '../services/leadService';
import { toast } from 'sonner';

interface NewLeadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewLeadDialog: React.FC<NewLeadDialogProps> = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Website Form'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("Name and phone are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await leadService.createLead(formData);
      toast.success("Lead created successfully");
      setFormData({ name: '', email: '', phone: '', source: 'Website Form' });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-2 border-border shadow-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-black italic tracking-tighter uppercase">INITIALIZE_LEAD_RECORD</DialogTitle>
          <DialogDescription className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Inject new data point into sequential qualification pipeline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Descriptor_Name</label>
            <Input 
              placeholder="e.g. Alex_Thompson" 
              className="bg-black border-border h-10 text-xs font-bold focus:ring-blue-500/20"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Registry_Email</label>
            <Input 
              type="email" 
              placeholder="user@network.node" 
              className="bg-black border-border h-10 text-xs font-bold focus:ring-blue-500/20"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Comms_Identity (Phone)</label>
            <Input 
              placeholder="+1 000 000 0000" 
              className="bg-black border-border h-10 text-xs font-bold focus:ring-blue-500/20"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Ingestion_Channel</label>
            <Select 
              value={formData.source} 
              onValueChange={(val) => setFormData({...formData, source: val})}
            >
              <SelectTrigger className="bg-black border-border h-10 text-xs font-bold">
                <SelectValue placeholder="Select Source" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-border text-zinc-300">
                <SelectItem value="Website Form">Website Form</SelectItem>
                <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Manual Add">Manual Add</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-6 gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-xs h-10 bg-transparent hover:bg-zinc-900">ABORT</Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-black italic tracking-tighter text-xs h-10 px-8" disabled={isSubmitting}>
              {isSubmitting ? "SYNCING..." : "COMMIT_RECORD"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
