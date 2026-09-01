import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Search,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
  CheckCircle2,
  Sparkles,
  FileText,
  Tag,
  User,
  Globe,
  FileUp,
  Link2,
  Upload,
  Image as ImageIcon,
  ArrowLeft,
  Save,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getAdminBlogsApi,
  createBlogApi,
  updateBlogApi,
  deleteBlogApi,
  toggleBlogStatusApi
} from '../services/blogService';
import BlogEditor from '../components/BlogEditor/BlogEditor';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Reset pagination to page 1 when search query or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Notification Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // View Mode: 'list' (Blogs Cards Grid) or 'editor' (Full Page Form View)
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'editor'
  const [editingBlog, setEditingBlog] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Image Upload State
  const [imageSource, setImageSource] = useState('file'); // 'file' | 'url'
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const initialFormState = {
    title: '',
    slug: '',
    category: 'DOCTOR CONSULTATION',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    shortDescription: '',
    content: '',
    publishDate: new Date().toISOString().split('T')[0],
    readTime: '5 min read',
    status: 'Published',
    featured: false,
    author: 'Dr. Vinish Kumar Singh',
    authorRole: 'Senior Consultant Urologist & Laser Surgeon'
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch blogs from API
  const fetchBlogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminBlogsApi();
      if (res && res.success) {
        setBlogs(res.data || []);
      } else {
        setBlogs(res || []);
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
      setError(err.response?.data?.message || 'Failed to load blogs from server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    if (type === 'error') {
      toast.error(message);
    } else if (type === 'info') {
      toast.info(message);
    } else {
      toast.success(message);
    }
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Helper to generate slug from title
  const handleTitleChange = (e) => {
    const titleVal = e.target.value;
    setFormData((prev) => {
      const autoSlug = titleVal
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      return {
        ...prev,
        title: titleVal,
        slug: prev.slug === '' || prev.slug === autoSlug.slice(0, prev.slug.length) ? autoSlug : prev.slug
      };
    });
  };

  // Helper for local image file upload preview
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImageFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setFormData((prev) => ({ ...prev, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  // Switch to Page View for Creating
  const handleOpenCreatePage = () => {
    setEditingBlog(null);
    setSelectedImageFile(null);
    setImageSource('file');
    setFormData({
      ...initialFormState,
      publishDate: new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to Page View for Editing
  const handleOpenEditPage = (blog) => {
    setEditingBlog(blog);
    setSelectedImageFile(null);
    setImageSource(blog.image?.startsWith('data:') ? 'file' : 'url');
    setFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      category: blog.category || 'DOCTOR CONSULTATION',
      image: blog.image || '',
      shortDescription: blog.shortDescription || blog.summary || blog.excerpt || '',
      content: blog.content || '',
      publishDate: blog.publishDate || new Date().toISOString().split('T')[0],
      readTime: blog.readTime || '5 min read',
      status: blog.status || 'Published',
      featured: Boolean(blog.featured),
      author: blog.author || 'Dr. Vinish Kumar Singh',
      authorRole: blog.authorRole || 'Senior Consultant Urologist & Laser Surgeon'
    });
    setFormError('');
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to Listing View
  const handleBackToList = () => {
    setViewMode('list');
    setEditingBlog(null);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Form Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Blog title is required');
      return;
    }
    if (!formData.content.trim()) {
      setFormError('Blog content is required');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (editingBlog) {
        // Update Blog
        const res = await updateBlogApi(editingBlog._id || editingBlog.id, formData);
        if (res.success) {
          showToast('Blog updated successfully!');
          setViewMode('list');
          fetchBlogs();
        } else {
          setFormError(res.message || 'Failed to update blog');
        }
      } else {
        // Create Blog
        const res = await createBlogApi(formData);
        if (res.success) {
          showToast('Blog published successfully!');
          setViewMode('list');
          fetchBlogs();
        } else {
          setFormError(res.message || 'Failed to create blog');
        }
      }
    } catch (err) {
      console.error('Blog submit error:', err);
      setFormError(err.response?.data?.message || 'Error processing blog request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Toggle (Draft <-> Published)
  const handleToggleStatus = async (blog) => {
    try {
      const res = await toggleBlogStatusApi(blog._id || blog.id);
      if (res.success) {
        const newStatus = res.data?.status || (blog.status === 'Published' ? 'Draft' : 'Published');
        showToast(`Blog status changed to ${newStatus}`);
        setBlogs((prev) =>
          prev.map((b) => ((b._id || b.id) === (blog._id || blog.id) ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err) {
      console.error('Status toggle error:', err);
      showToast('Failed to change blog status', 'error');
    }
  };

  // Open Delete Confirmation Modal
  const handlePromptDelete = (blog) => {
    setBlogToDelete(blog);
    setDeleteModalOpen(true);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!blogToDelete) return;
    setDeleting(true);

    try {
      const res = await deleteBlogApi(blogToDelete._id || blogToDelete.id);
      if (res.success) {
        showToast('Blog deleted successfully');
        setBlogs((prev) => prev.filter((b) => (b._id || b.id) !== (blogToDelete._id || blogToDelete.id)));
        setDeleteModalOpen(false);
        setBlogToDelete(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete blog', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered Blogs
  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination Calculations
  const totalBlogs = filteredBlogs.length;
  const totalPages = Math.ceil(totalBlogs / ITEMS_PER_PAGE) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Generate page numbers array with ellipsis if needed
  const getPageNumbers = (current, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-900/90 border-rose-700 text-white'
              : 'bg-slate-900/90 border-slate-700 text-white backdrop-blur-md'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 1: BLOGS LISTING VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <>
          {/* Top Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight">Health Blogs</h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Publish urology education articles for patients
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchBlogs}
                disabled={loading}
                className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-all cursor-pointer"
                title="Refresh Blogs"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleOpenCreatePage}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-600/25 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create New Blog
              </button>
            </div>
          </div>

          {/* Filters & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {['All', 'Published', 'Draft'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200/80 shadow-2xs text-slate-400">
              <Loader2 className="w-9 h-9 text-blue-600 animate-spin mb-3" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Loading Health Blogs...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <h3 className="text-sm font-bold text-rose-800">Error Loading Blogs</h3>
              <p className="text-xs text-rose-600 max-w-md mx-auto">{error}</p>
              <button
                onClick={fetchBlogs}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Fetching
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredBlogs.length === 0 && (
            <div className="py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 mx-auto flex items-center justify-center border border-blue-100 shadow-2xs">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">No Blogs Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'All'
                    ? 'No blog articles match your current search or filter criteria.'
                    : 'No health blogs published yet. Click the button below to create your first patient article.'}
                </p>
              </div>
              <button
                onClick={handleOpenCreatePage}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create First Blog
              </button>
            </div>
          )}

          {/* Blog Cards Grid & Pagination */}
          {!loading && !error && filteredBlogs.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedBlogs.map((blog) => {
                  const isPublished = blog.status === 'Published';
                  return (
                    <div
                      key={blog._id || blog.id}
                      className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                    >
                      <div>
                        {/* Image Container with Badges */}
                        <div className="relative h-52 sm:h-56 bg-slate-100 overflow-hidden">
                          <img
                            src={blog.image || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800'}
                            alt={blog.title}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800';
                            }}
                          />

                          {/* Category Pill */}
                          <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-slate-900/85 text-white backdrop-blur-md border border-white/20 shadow-xs">
                            {blog.category || 'Urology Care'}
                          </span>

                          {/* Featured Star Badge */}
                          {blog.featured && (
                            <span className="absolute top-3 right-3 p-1.5 rounded-full bg-amber-500 text-white shadow-md" title="Featured Blog">
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </span>
                          )}

                          {/* Status Pill Badge */}
                          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                            <span
                              className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full backdrop-blur-md border ${
                                isPublished
                                  ? 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-xs'
                                  : 'bg-amber-500/90 text-white border-amber-400/50 shadow-xs'
                              }`}
                            >
                              {blog.status}
                            </span>
                          </div>
                        </div>

                        {/* Body Content */}
                        <div className="p-5 space-y-2">
                          <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {blog.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                            {blog.shortDescription || blog.summary || blog.excerpt || (typeof blog.content === 'string' ? blog.content.slice(0, 120) : 'No summary available...')}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer Meta & Actions */}
                      <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-medium text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {blog.publishDate || 'Recent'}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {blog.readTime || '5 min'}
                          </span>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center gap-1">
                          {/* Status Toggle Button */}
                          <button
                            onClick={() => handleToggleStatus(blog)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isPublished
                                ? 'text-slate-600 hover:text-amber-600 bg-white hover:bg-amber-50 border-slate-200'
                                : 'text-amber-600 hover:text-emerald-600 bg-amber-50 hover:bg-emerald-50 border-amber-200'
                            }`}
                            title={isPublished ? 'Switch to Draft' : 'Publish Blog'}
                          >
                            {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditPage(blog)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="Edit Blog"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handlePromptDelete(blog)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="Delete Blog"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:px-6 rounded-3xl border border-slate-200/80 shadow-2xs">
                  <div className="text-xs text-slate-500 font-medium">
                    Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to{' '}
                    <span className="font-bold text-slate-800">{Math.min(startIndex + ITEMS_PER_PAGE, totalBlogs)}</span> of{' '}
                    <span className="font-bold text-slate-800">{totalBlogs}</span> blogs
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={validCurrentPage === 1}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    {/* Page Numbers */}
                    {getPageNumbers(validCurrentPage, totalPages).map((pageNum, idx) =>
                      pageNum === '...' ? (
                        <span key={`dots-${idx}`} className="px-2 text-xs font-bold text-slate-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            validCurrentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={validCurrentPage === totalPages}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: DEDICATED FULL PAGE BLOG EDITOR */}
      {/* ========================================================================= */}
      {viewMode === 'editor' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Page Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToList}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Back to Blogs List"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Blogs</span>
              </button>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {editingBlog ? 'Edit Health Blog' : 'Create New Health Blog'}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {editingBlog
                    ? `Editing article: "${editingBlog.title}"`
                    : 'Publish educational urology articles for website patients'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleBackToList}
                className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingBlog ? 'Save Changes' : 'Publish Blog'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Form Page Container */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
            {formError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Title & Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Blog Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g. Preventing Kidney Stones: 5 Tips from a Urologist"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer"
                >
                  <option value="DOCTOR CONSULTATION">DOCTOR CONSULTATION</option>
                  <option value="KIDNEY HEALTH">KIDNEY HEALTH</option>
                  <option value="FEMALE UROLOGY & CARE">FEMALE UROLOGY & CARE</option>
                  <option value="PROSTATE CARE">PROSTATE CARE</option>
                  <option value="LASER SURGERIES">LASER SURGERIES</option>
                  <option value="ANDROLOGY & INFERTILITY">ANDROLOGY & INFERTILITY</option>
                  <option value="GENERAL UROLOGY">GENERAL UROLOGY</option>
                </select>
              </div>
            </div>

            {/* Slug & Featured Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="preventing-kidney-stones"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              {/* Featured Image Section with Device Upload & Web URL */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Featured Image
                  </label>
                  {/* Source Switcher Tabs */}
                  <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setImageSource('file')}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        imageSource === 'file'
                          ? 'bg-white text-blue-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      <span>Upload from Device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSource('url')}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        imageSource === 'url'
                          ? 'bg-white text-blue-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Image URL</span>
                    </button>
                  </div>
                </div>

                {imageSource === 'file' ? (
                  <div>
                    <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer bg-white hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />

                      {formData.image && (formData.image.startsWith('data:') || selectedImageFile) ? (
                        <div className="w-full space-y-2">
                          <img
                            src={formData.image}
                            alt="Selected Blog Preview"
                            className="h-36 max-w-full object-contain mx-auto rounded-xl border border-slate-200 shadow-2xs"
                          />
                          <span className="text-xs font-semibold text-blue-600 block truncate">
                            {selectedImageFile?.name || 'Photo Selected'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Click to select a different photo</span>
                        </div>
                      ) : (
                        <div className="py-3 flex flex-col items-center">
                          <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-700">Click to choose photo from your computer</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Supports JPG, PNG, WEBP, GIF formats</p>
                        </div>
                      )}
                    </label>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                    {formData.image && (
                      <div className="mt-2.5 flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                        <img
                          src={formData.image}
                          alt="URL Preview"
                          className="w-12 h-12 object-cover rounded-lg shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800';
                          }}
                        />
                        <span className="text-[11px] text-slate-500 truncate font-mono">{formData.image}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Short Description / Excerpt
              </label>
              <textarea
                rows={2}
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Brief 1-2 sentence summary of the article for blog card preview..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            {/* Full Blog Content */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase  tracking-wider mb-2">
                Full Blog Content <span className="text-rose-500">*</span>
              </label>
              <BlogEditor
                value={formData.content}
                
                onChange={(content) => setFormData({ ...formData, content })}
              />
            </div>

            {/* Publish Date, Read Time, Status & Featured Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Publish Date
                </label>
                <input
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Read Time
                </label>
                <input
                  type="text"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  placeholder="e.g. 5 min read"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Visibility Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="Published">Published (Visible on Website)</option>
                  <option value="Draft">Draft (Hidden from Public)</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>
            </div>

            {/* Author Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Author Name
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Author Designation / Role
                </label>
                <input
                  type="text"
                  value={formData.authorRole}
                  onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Bottom Form Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleBackToList}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Blogs List
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Article...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingBlog ? 'Save Changes' : 'Publish Blog'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteModalOpen && blogToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-2xs">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-800">Delete Blog Article?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800">"{blogToDelete.title}"</strong>?
              </p>
              <p className="text-[11px] text-rose-600 font-semibold mt-2 bg-rose-50 p-2 rounded-xl border border-rose-100">
                This action cannot be undone and will remove it from the public website.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setBlogToDelete(null);
                }}
                disabled={deleting}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
