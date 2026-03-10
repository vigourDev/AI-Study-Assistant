export default function LoadingSpinner({ size = 'md', text }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizes[size]}`} />
      {text && <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>}
    </div>
  );
}
