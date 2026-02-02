'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Lock } from "lucide-react";

export function MultiplesAssumptions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Fund Multiples Assumptions</CardTitle>
                <CardDescription className="text-xs">
                    Multiples represent outcome targets used to shape expected distributions and remaining value.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="font-semibold">TVPI</Label>
                        <Badge variant="secondary">Template</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Min" defaultValue="1.8x" />
                        <Input placeholder="Target" defaultValue="2.2x" className="font-bold text-center border-primary" />
                        <Input placeholder="Max" defaultValue="2.5x" />
                    </div>
                </div>

                <div className="space-y-2">
                     <div className="flex items-center space-x-2">
                        <Switch id="dpi-enable" />
                        <Label htmlFor="dpi-enable" className="font-semibold">DPI</Label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Min" />
                        <Input placeholder="Target" defaultValue="1.5x" />
                        <Input placeholder="Max" />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Switch id="rvpi-enable" />
                        <Label htmlFor="rvpi-enable" className="font-semibold">RVPI</Label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Min" />
                        <Input placeholder="Target" defaultValue="0.7x" />
                        <Input placeholder="Max" />
                    </div>
                </div>

                <div className="flex items-start space-x-2 rounded-md border p-3 bg-muted/50">
                    <Checkbox id="lock-assumptions" />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="lock-assumptions" className="font-medium">
                            Lock to Manager Published Assumptions
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            When locked, assumptions are read-only and will automatically update if the manager provides new data.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
