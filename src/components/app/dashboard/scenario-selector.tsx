'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Scenario } from '@/lib/types';

type ScenarioSelectorProps = {
  selectedScenario: Scenario;
  onScenarioChange: (scenario: Scenario) => void;
};

const scenarios: Scenario[] = [
  'Base Case',
  'Slow Deployment',
  'Fast Deployment',
  'Downside Vintage',
];

export function ScenarioSelector({
  selectedScenario,
  onScenarioChange,
}: ScenarioSelectorProps) {
  return (
    <Select value={selectedScenario} onValueChange={onScenarioChange}>
      <SelectTrigger className="w-[200px] bg-secondary/50 border-border">
        <SelectValue placeholder="Select Scenario" />
      </SelectTrigger>
      <SelectContent>
        {scenarios.map((scenario) => (
          <SelectItem key={scenario} value={scenario}>
            {scenario}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
