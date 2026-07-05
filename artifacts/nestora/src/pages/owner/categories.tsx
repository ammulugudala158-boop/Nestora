import { useListCategories, useCreateCategory, useDeleteCategory } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminCategories() {
  const { data: categories = [], isLoading, refetch } = useListCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    createCategory.mutate({ data: { name: newCategoryName } }, {
      onSuccess: () => {
        toast.success("Category created");
        setNewCategoryName('');
        refetch();
      },
      onError: () => toast.error("Failed to create category")
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteCategory.mutate({ id }, {
        onSuccess: () => {
          toast.success("Category deleted");
          refetch();
        },
        onError: () => toast.error("Failed to delete category")
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Categories</h1>
        <p className="text-muted-foreground mt-1">Organize your products into logical groups.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Loading categories...</TableCell>
                    </TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No categories defined yet.</TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id} className="group">
                        <TableCell className="text-muted-foreground">
                          <GripVertical className="h-4 w-4 cursor-move opacity-30 hover:opacity-100 transition-opacity" />
                        </TableCell>
                        <TableCell className="font-medium text-base">{category.name}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(category.id, category.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card className="border-border/50 shadow-sm sticky top-24">
            <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
              <CardTitle className="text-lg font-serif">Add Category</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="catName">Category Name</label>
                  <Input 
                    id="catName"
                    placeholder="e.g. Ceramics" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full gap-2 font-bold" disabled={!newCategoryName.trim() || createCategory.isPending}>
                  <Plus className="h-4 w-4" /> {createCategory.isPending ? "Adding..." : "Add Category"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
