'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const tags = ["IC Base", "IC Stress", "Liquidity Stress", "Manager Published", "Internal Template"];

export function NotesTagging() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Notes & Tagging</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea placeholder="Add notes for internal context, investment committee memos, etc." rows={4} />
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
