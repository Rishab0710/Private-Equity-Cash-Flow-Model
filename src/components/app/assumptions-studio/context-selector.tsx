'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Upload } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { funds } from '@/lib/data';

const strategies = [
    "Buyout PE", "Growth PE", "Venture Capital", "Infrastructure Core", 
    "Infrastructure Value-Add", "Secondaries", "Private Credit", "Real Estate"
];

export function ContextSelector() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search Funds..." className="pl-8" />
                </div>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a Fund" />
                    </SelectTrigger>
                    <SelectContent>
                        {funds.map(fund => (
                            <SelectItem key={fund.id} value={fund.id}>{fund.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Strategy Template" />
                    </SelectTrigger>
                    <SelectContent>
                        {strategies.map(strategy => (
                            <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Assumption Source</Label>
                    <RadioGroup defaultValue="house" className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="house" id="house" />
                            <Label htmlFor="house" className="font-normal text-sm">House Template</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="manager" id="manager" />
                            <Label htmlFor="manager" className="font-normal text-sm">Manager Published</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom" className="font-normal text-sm">Custom</Label>
                        </div>
                    </RadioGroup>
                </div>
                <Button variant="outline" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Assumptions
                </Button>
            </CardContent>
        </Card>
    );
}
