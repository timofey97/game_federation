"use client";

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { GameItem } from '@/types/game';
import { useTranslation } from '@/i18n/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, Save, RefreshCw } from 'lucide-react';

interface BoardSetupProps {
  items: GameItem[];
  onItemsUpdate: (items: GameItem[]) => void;
}

export interface BoardSetupRef {
  getCurrentItems: () => GameItem[];
}

const BoardSetup = forwardRef<BoardSetupRef, BoardSetupProps>(({ items, onItemsUpdate }, ref) => {
  const { t } = useTranslation();
  const [editableItems, setEditableItems] = useState<GameItem[]>([]);
  const [jsonContent, setJsonContent] = useState<string>('');
  const [jsonError, setJsonError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getCurrentItems: () => editableItems
  }));

  // Load items from localStorage on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem('boardItems');
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        setEditableItems(parsedItems);
        // Don't call onItemsUpdate here to avoid infinite update loop
      } catch (error) {
        console.error('Error loading items from localStorage:', error);
        setEditableItems([...items]);
      }
    } else {
      setEditableItems([...items]);
    }
  }, [items]);

  // Update JSON content when items change
  useEffect(() => {
    setJsonContent(JSON.stringify({ items: editableItems }, null, 2));
  }, [editableItems]);

  const handleItemUpdate = (index: number, field: keyof GameItem, value: string) => {
    const newItems = [...editableItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditableItems(newItems);
  };

  const handleSaveItems = () => {
    onItemsUpdate(editableItems);
    localStorage.setItem('boardItems', JSON.stringify(editableItems));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedContent = JSON.parse(content);
        
        if (Array.isArray(parsedContent.items)) {
          setEditableItems(parsedContent.items);
          setJsonContent(content);
          setJsonError('');
        } else {
          setJsonError(t('game.settings.invalidJsonFormat') || 'Invalid JSON format. Expected { items: [] }');
        }
      } catch (error) {
        setJsonError(t('game.settings.invalidJson') || 'Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleJsonContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonContent(e.target.value);
    try {
      const parsedContent = JSON.parse(e.target.value);
      if (Array.isArray(parsedContent.items)) {
        setEditableItems(parsedContent.items);
        setJsonError('');
      } else {
        setJsonError(t('game.settings.invalidJsonFormat') || 'Invalid JSON format. Expected { items: [] }');
      }
    } catch (error) {
      setJsonError(t('game.settings.invalidJson') || 'Invalid JSON');
    }
  };

  const handleApplyChanges = () => {
    onItemsUpdate(editableItems);
    localStorage.setItem('boardItems', JSON.stringify(editableItems));
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const downloadJsonFile = () => {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'board-items.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="visual">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visual">{t('game.settings.visualEditor') || 'Visual Editor'}</TabsTrigger>
          <TabsTrigger value="json">{t('game.settings.jsonEditor') || 'JSON Editor'}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visual" className="space-y-4">
          <div className="max-h-[400px] overflow-y-auto pr-2">
            {editableItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 mb-2 p-2 border rounded-md dark:border-gray-700 bg-gray-100 dark:bg-stone-800">
                <div className="w-10 h-10 flex items-center justify-center text-2xl">
                  {item.icon}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`item-name-${index}`} className="text-xs">
                      {t('game.settings.itemName') || 'Name'}
                    </Label>
                    <Input
                      id={`item-name-${index}`}
                      value={item.name}
                      onChange={(e) => handleItemUpdate(index, 'name', e.target.value)}
                      className="h-8 dark:bg-stone-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-icon-${index}`} className="text-xs">
                      {t('game.settings.itemIcon') || 'Icon'}
                    </Label>
                    <Input
                      id={`item-icon-${index}`}
                      value={item.icon}
                      onChange={(e) => handleItemUpdate(index, 'icon', e.target.value)}
                      className="h-8 dark:bg-stone-700"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Removed Save and Apply buttons */}
        </TabsContent>
        
        <TabsContent value="json" className="space-y-4">
          {jsonError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{jsonError}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2 mb-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              variant="outline" 
              onClick={triggerFileUpload}
              className="flex items-center gap-2 dark:bg-stone-800 dark:hover:bg-stone-700"
            >
              <Upload className="w-4 h-4" />
              {t('game.settings.uploadJson') || 'Upload JSON'}
            </Button>
            <Button 
              variant="outline" 
              onClick={downloadJsonFile}
              className="flex items-center gap-2 dark:bg-stone-800 dark:hover:bg-stone-700"
            >
              <Save className="w-4 h-4" />
              {t('game.settings.downloadJson') || 'Download JSON'}
            </Button>
          </div>
          
          <textarea
            value={jsonContent}
            onChange={handleJsonContentChange}
            className="w-full h-[400px] p-2 font-mono text-sm border rounded-md dark:bg-stone-800 dark:border-gray-700"
          />
          
          {/* Removed Apply Changes button */}
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default BoardSetup;
