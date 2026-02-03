'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, DownloadCloud, PlayCircle } from "lucide-react";
import { useState } from "react";
import { CompareDrawer } from "./compare-drawer";
import { useToast } from "@/hooks/use-toast";

const initialSets = [
    { id: 1, fund: 'Growth Equity Fund V', strategy: 'Growth PE', vintage: 2021, commitment: 100, scenario: 'Base Case', updated: '2 days ago', status: 'Active' },
    { id: 2, fund: 'Venture Partners II', strategy: 'Venture Capital', vintage: 2022, commitment: 50, scenario: 'Downside Stress', updated: '1 month ago', status: 'Draft' },
    { id: 3, fund: 'Global Infrastructure Fund', strategy: 'Infrastructure', vintage: 2020, commitment: 250, scenario: 'Rising Rates', updated: '3 weeks ago', status: 'Draft' },
    { id: 4, fund: 'Buyout Leaders IV', strategy: 'Buyout PE', vintage: 2019, commitment: 150, scenario: 'Base Case', updated: '1 day ago', status: 'Active' },
];

export function AssumptionSets() {
    const { toast } = useToast();
    const [selectedSets, setSelectedSets] = useState<number[]>([]);
    const [isCompareDrawerOpen, setCompareDrawerOpen] = useState(false);
    const [sets, setSets] = useState(initialSets);

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
        <Card className="border-black/10">
            <CardHeader className="py-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-highlight font-bold uppercase tracking-tight">Saved Assumption Sets</CardTitle>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 font-medium text-black border-black/20">
                        <DownloadCloud className="h-3 w-3 mr-1" /> Export All
                    </Button>
                    <Button size="sm" className="h-7 text-[10px] px-3 bg-primary text-white font-medium" onClick={handleCompare} disabled={selectedSets.length < 2}>
                        Compare Selected ({selectedSets.length})
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent h-8">
                            <TableHead className="w-10 text-center"></TableHead>
                            <TableHead className="text-black font-bold text-[10px] uppercase h-8">Fund Name</TableHead>
                            <TableHead className="text-black font-bold text-[10px] uppercase h-8">Strategy</TableHead>
                            <TableHead className="text-black font-bold text-[10px] uppercase h-8">Vintage</TableHead>
                            <TableHead className="text-black font-bold text-[10px] uppercase h-8">Comm. ($M)</TableHead>
                            <TableHead className="text-black font-bold text-[10px] uppercase h-8">Scenario</TableHead>
                            <TableHead className="text-black font-bold text-[10px] uppercase h-8">Updated</TableHead>
                            <TableHead className="text-black font-bold text-[10px] uppercase h-8">Status</TableHead>
                            <TableHead className="text-right text-black font-bold text-[10px] uppercase h-8 pr-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sets.map(set => (
                            <TableRow key={set.id} className="hover:bg-muted/20 h-9">
                                <TableCell className="py-1 text-center">
                                    <Checkbox 
                                        onCheckedChange={(checked) => handleCheckboxChange(set.id, checked)}
                                        checked={selectedSets.includes(set.id)}
                                        className="h-3.5 w-3.5 border-black/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                </TableCell>
                                <TableCell className="font-semibold text-black text-[11px] py-1">{set.fund}</TableCell>
                                <TableCell className="text-black font-medium text-[11px] py-1">{set.strategy}</TableCell>
                                <TableCell className="text-black font-medium text-[11px] py-1">{set.vintage}</TableCell>
                                <TableCell className="text-black font-bold text-[11px] py-1">${set.commitment}M</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-semibold bg-secondary/40 text-black border-none">
                                        {set.scenario}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-black font-medium text-[11px] py-1">{set.updated}</TableCell>
                                <TableCell className="py-1">
                                    <Badge variant={set.status === 'Active' ? 'outline' : 'default'} className={set.status === 'Active' ? 'border-green-600/50 text-green-600 text-[9px] h-4 px-1.5' : 'bg-muted text-black text-[9px] h-4 px-1.5 border-none'}>
                                        {set.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right py-1 pr-4">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-7 w-7 p-0 text-black hover:bg-muted">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-3.5 w-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-32">
                                            <DropdownMenuItem onClick={() => handleLoadSet(set.fund)} className="text-[11px] font-semibold text-black cursor-pointer">
                                                <PlayCircle className="h-3 w-3 mr-2 text-primary" /> Load Set
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
            </CardContent>
            <CompareDrawer isOpen={isCompareDrawerOpen} onOpenChange={setCompareDrawerOpen} sets={sets.filter(s => selectedSets.includes(s.id)).map(s => ({ ...s, name: s.fund, source: s.scenario }))} />
        </Card>
    );
}