
import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from "lucide-react";

interface CourseNodeProps {
  data: {
    title: string;
    description: string;
    isDark: boolean;
  };
  isConnectable: boolean;
}

const CourseNode = memo(({ data, isConnectable }: CourseNodeProps) => {
  const { title, description, isDark } = data;
  
  return (
    <>
      <Card className={`border-2 ${isDark ? 'border-emerald-700 bg-slate-800' : 'border-emerald-500 bg-white'}`}>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${isDark ? 'bg-emerald-800' : 'bg-emerald-100'}`}>
              <Book className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <CardTitle className="text-lg">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <p className="text-sm text-muted-foreground line-clamp-4">
            {description}
          </p>
        </CardContent>
      </Card>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
      <Handle
        type="source"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
      <Handle
        type="source"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
    </>
  );
});

CourseNode.displayName = 'CourseNode';

export default CourseNode;