import { Spinner } from "@/components/ui/spinner";

const FullscreenLoader = () => {
  return (
    <div className="fixed inset-0 z-50 select-none flex items-center justify-center bg-black bg-opacity-40" style={{opacity: '0.6'}}>
      	<Spinner className="w-10 h-10 text-white" />
    </div>
  );
};

export default FullscreenLoader;
