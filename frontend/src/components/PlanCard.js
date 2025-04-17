const PlanCard = ({ plan, onSelect }) => {
    return (
      <div className="border p-4 rounded shadow-md mb-4 bg-white">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        <p className="text-gray-600 mb-2">Price: {plan.price}</p>
        <button
          onClick={() => onSelect(plan)}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Select Plan
        </button>
      </div>
    );
  };
  
  export default PlanCard;
  