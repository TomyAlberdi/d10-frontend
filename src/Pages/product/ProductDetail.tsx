import { useParams } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Product Details</h1>
      <p className="text-gray-400">Product ID: {id}</p>
      <p className="text-gray-400">Product detail content will go here</p>
    </div>
  );
};

export default ProductDetail;
