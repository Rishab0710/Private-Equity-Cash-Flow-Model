'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const tags = ["IC Base", "IC Stress", "Liquidity Stress", "Manager Published", "Internal Template"];

export function NotesTagging() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base text-black font-bold">Notes & Tagging</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea placeholder="Add notes for internal context, investment committee memos, etc." rows={4} className="text-black placeholder:text-black/50" />
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-black border-black/20">{tag}</Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
