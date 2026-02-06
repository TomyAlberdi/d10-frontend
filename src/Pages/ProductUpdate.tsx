import { useParams } from "react-router-dom";

const ProductUpdate = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Update Product</h1>
      <p className="text-gray-400">Product ID: {id}</p>
      <p className="text-gray-400">Product update form will go here</p>
    </div>
  );
};

export default ProductUpdate;
