'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { CompareDrawer } from "./compare-drawer";

const sets = [
    { id: 1, name: 'Q1 2024 - Base Case', strategy: 'Buyout PE', source: 'House Template', updated: '2 days ago', status: 'Active' },
    { id: 2, name: 'Manager Published - March 2024', strategy: 'Buyout PE', source: 'Manager', updated: '1 month ago', status: 'Draft' },
    { id: 3, name: 'IC Stress Test - Recession', strategy: 'Buyout PE', source: 'Custom', updated: '3 weeks ago', status: 'Draft' },
];

export function AssumptionSets() {
    const [selectedSets, setSelectedSets] = useState<number[]>([]);
    const [isCompareDrawerOpen, setCompareDrawerOpen] = useState(false);

    const handleCompare = () => {
        if (selectedSets.length >= 2) {
            setCompareDrawerOpen(true);
        }
    }

    const handleCheckboxChange = (setId: number, checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedSets(prev => [...prev, setId]);
        } else {
            setSelectedSets(prev => prev.filter(id => id !== setId));
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base text-black font-bold">Saved Assumption Sets</CardTitle>
                <Button size="sm" className="h-8 text-xs px-3 bg-primary text-white" onClick={handleCompare} disabled={selectedSets.length < 2}>Compare ({selectedSets.length})</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12"></TableHead>
                            <TableHead className="text-black font-bold">Set Name</TableHead>
                            <TableHead className="text-black font-bold">Strategy</TableHead>
                            <TableHead className="text-black font-bold">Source</TableHead>
                            <TableHead className="text-black font-bold">Last Updated</TableHead>
                            <TableHead className="text-black font-bold">Status</TableHead>
                            <TableHead className="text-right text-black font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sets.map(set => (
                            <TableRow key={set.id} className="hover:bg-muted/30">
                                <TableCell>
                                    <Checkbox 
                                        onCheckedChange={(checked) => handleCheckboxChange(set.id, checked)}
                                        checked={selectedSets.includes(set.id)}
                                        className="border-black data-[state=checked]:bg-black"
                                    />
                                </TableCell>
                                <TableCell className="font-bold text-black">{set.name}</TableCell>
                                <TableCell className="text-black font-medium">{set.strategy}</TableCell>
                                <TableCell><Badge variant={set.source === 'Custom' ? 'default' : 'secondary'} className="text-black border-black/10">{set.source}</Badge></TableCell>
                                <TableCell className="text-black font-medium">{set.updated}</TableCell>
                                <TableCell><Badge variant={set.status === 'Active' ? 'outline' : 'default'} className={set.status === 'Active' ? 'border-green-600 text-green-600' : 'text-black'}>{set.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-black">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="text-black font-medium">Load</DropdownMenuItem>
                                            <DropdownMenuItem className="text-black font-medium">Duplicate</DropdownMenuItem>
                                            <DropdownMenuItem className="text-black font-medium">Rename</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive font-medium">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CompareDrawer isOpen={isCompareDrawerOpen} onOpenChange={setCompareDrawerOpen} sets={sets.filter(s => selectedSets.includes(s.id))} />
        </Card>
    );
}
