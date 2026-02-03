'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { MoreHorizontal, PlayCircle, Layers } from "lucide-react";
import { useState } from "react";
import { CompareDrawer } from "./compare-drawer";
import { useToast } from "@/hooks/use-toast";

const initialSets = [
    { id: 1, fund: 'Growth Equity Fund V', strategy: 'Growth PE', vintage: 2021, commitment: 100, updatedBy: 'Sarah J.', updated: '2 days ago', status: 'Active' },
    { id: 2, fund: 'Venture Partners II', strategy: 'Venture Capital', vintage: 2022, commitment: 50, updatedBy: 'Mark T.', updated: '1 month ago', status: 'Draft' },
    { id: 3, fund: 'Global Infrastructure Fund', strategy: 'Infrastructure', vintage: 2020, commitment: 250, updatedBy: 'Elena R.', updated: '3 weeks ago', status: 'Draft' },
    { id: 4, fund: 'Buyout Leaders IV', strategy: 'Buyout PE', vintage: 2019, commitment: 150, updatedBy: 'John D.', updated: '1 day ago', status: 'Active' },
];

export function AssumptionSets() {
    const { toast } = useToast();
    const [selectedSets, setSelectedSets] = useState<number[]>([]);
    const [isCompareDrawerOpen, setCompareDrawerOpen] = useState(false);
    const [sets] = useState(initialSets);

    const handleCompare = () => {
        if (selectedSets.length >= 2) {
            setCompareDrawerOpen(true);
        }
    }

    const handleLoadSet = (setName: string) => {
        toast({
            title: "Assumptions Loaded",
            description: `Successfully loaded parameters for ${setName}.`,
        });
    };

    const handleCheckboxChange = (setId: number, checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedSets(prev => [...prev, setId]);
        } else {
            setSelectedSets(prev => prev.filter(id => id !== setId));
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-7 px-3 text-[10px] border-primary text-primary hover:bg-primary/10 font-medium">
                    View Assumption Sets
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-0 flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle className="text-lg text-highlight font-bold uppercase tracking-tight">Saved Assumption Sets</DialogTitle>
                        <DialogDescription className="text-xs text-black font-medium mt-1">
                            Browse and manage your portfolio assumption models.
                        </DialogDescription>
                    </div>
                    <Button 
                        size="sm" 
                        className="h-8 text-[11px] px-4 bg-primary text-white font-bold" 
                        onClick={handleCompare} 
                        disabled={selectedSets.length < 2}
                    >
                        <Layers className="h-3.5 w-3.5 mr-2" />
                        Compare Selected ({selectedSets.length})
                    </Button>
                </DialogHeader>
                
                <div className="p-6 pt-4 overflow-auto">
                    <div className="rounded-md border border-black/10 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent h-9">
                                    <TableHead className="w-10 text-center"></TableHead>
                                    <TableHead className="text-black font-bold text-[10px] uppercase h-9">Fund Name</TableHead>
                                    <TableHead className="text-black font-bold text-[10px] uppercase h-9">Strategy</TableHead>
                                    <TableHead className="text-black font-bold text-[10px] uppercase h-9">Vintage</TableHead>
                                    <TableHead className="text-black font-bold text-[10px] uppercase h-9">Comm. ($M)</TableHead>
                                    <TableHead className="text-black font-bold text-[10px] uppercase h-9">Updated By</TableHead>
                                    <TableHead className="text-black font-bold text-[10px] uppercase h-9">Updated</TableHead>
                                    <TableHead className="text-black font-bold text-[10px] uppercase h-9">Status</TableHead>
                                    <TableHead className="text-right text-black font-bold text-[10px] uppercase h-9 pr-4">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sets.map(set => (
                                    <TableRow key={set.id} className="hover:bg-muted/20 h-10">
                                        <TableCell className="py-1 text-center">
                                            <Checkbox 
                                                onCheckedChange={(checked) => handleCheckboxChange(set.id, checked)}
                                                checked={selectedSets.includes(set.id)}
                                                className="h-3.5 w-3.5 border-black/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                        </TableCell>
                                        <TableCell className="font-bold text-black text-[11px] py-1">{set.fund}</TableCell>
                                        <TableCell className="text-black font-medium text-[11px] py-1">{set.strategy}</TableCell>
                                        <TableCell className="text-black font-medium text-[11px] py-1">{set.vintage}</TableCell>
                                        <TableCell className="text-black font-bold text-[11px] py-1">${set.commitment}M</TableCell>
                                        <TableCell className="text-black font-semibold text-[11px] py-1">{set.updatedBy}</TableCell>
                                        <TableCell className="text-black font-medium text-[11px] py-1">{set.updated}</TableCell>
                                        <TableCell className="py-1">
                                            <Badge variant={set.status === 'Active' ? 'outline' : 'default'} className={set.status === 'Active' ? 'border-green-600/50 text-green-600 text-[10px] h-4.5 px-2' : 'bg-muted text-black text-[10px] h-4.5 px-2 border-none'}>
                                                {set.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-1 pr-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-black hover:bg-muted">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-36">
                                                    <DropdownMenuItem onClick={() => handleLoadSet(set.fund)} className="text-[11px] font-bold text-black cursor-pointer">
                                                        <PlayCircle className="h-3.5 w-3.5 mr-2 text-primary" /> Load Set
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-[11px] font-medium text-black cursor-pointer">Duplicate</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-[11px] font-medium text-black cursor-pointer">Rename</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-[11px] font-bold text-destructive cursor-pointer">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                <CompareDrawer isOpen={isCompareDrawerOpen} onOpenChange={setCompareDrawerOpen} sets={sets.filter(s => selectedSets.includes(s.id)).map(s => ({ ...s, name: s.fund, source: 'Saved' }))} />
            </DialogContent>
        </Dialog>
    );
}