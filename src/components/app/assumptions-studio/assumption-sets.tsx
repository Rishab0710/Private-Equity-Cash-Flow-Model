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
                <CardTitle className="text-base">Saved Assumption Sets</CardTitle>
                <Button onClick={handleCompare} disabled={selectedSets.length < 2}>Compare ({selectedSets.length})</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Set Name</TableHead>
                            <TableHead>Strategy</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sets.map(set => (
                            <TableRow key={set.id}>
                                <TableCell>
                                    <Checkbox 
                                        onCheckedChange={(checked) => handleCheckboxChange(set.id, checked)}
                                        checked={selectedSets.includes(set.id)}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{set.name}</TableCell>
                                <TableCell>{set.strategy}</TableCell>
                                <TableCell><Badge variant={set.source === 'Custom' ? 'default' : 'secondary'}>{set.source}</Badge></TableCell>
                                <TableCell>{set.updated}</TableCell>
                                <TableCell><Badge variant={set.status === 'Active' ? 'outline' : 'default'} className={set.status === 'Active' ? 'border-green-500 text-green-500' : ''}>{set.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Load</DropdownMenuItem>
                                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                            <DropdownMenuItem>Rename</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
