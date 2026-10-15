import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface ModuleNodeProps {
  data: {
    module: {
      week: number;
      title: string;
      objectives: string[];
      timeSpent: string;
    };
    isDark: boolean;
    onSelect: () => void;
  };
  isConnectable: boolean;
}

const ModuleNode = memo(({ data, isConnectable }: ModuleNodeProps) => {
  const { module, isDark, onSelect } = data;
  
  return (
    <div onClick={onSelect}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
      <Card className={`border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'} hover:shadow-md transition-shadow cursor-pointer`}>
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base truncate">
              {module.title}
            </CardTitle>
            <Badge variant={isDark ? "outline" : "secondary"} className="text-xs">
              Week {module.week}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Clock className="h-3 w-3" />
            <span>{module.timeSpent}</span>
          </div>
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">
              {module.objectives.length} learning objectives
            </p>
          </div>
        </CardContent>
      </Card>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
    </div>
  );
});

ModuleNode.displayName = 'ModuleNode';

export default ModuleNode;