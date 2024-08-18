import { CloseEscrowFormProps } from "@/app/interfaces";
import Spinner from "../Spinner/Spinner";


const CloseEscrowForm: React.FC<CloseEscrowFormProps> = ({
  escrowAddress,
  handleCloseEscrow,
  setEscrowAddress,
  loading,
}) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCloseEscrow();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg"
    >

      <div className="mb-4">
        <p className="text-toekn-white text-sm font-bold mb-4">Enter the address of the escrow account you&apos;d like to close. No funny business, make sure it&apos;s yours.</p>
        <label
          htmlFor="escrowAddress"
          className="block text-toekn-orange text-sm font-bold mb-2"
        >
          Escrow Address
        </label>
        <input
          id="escrowAddress"
          type="text"
          value={escrowAddress}
          onChange={(e) => setEscrowAddress(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-toekn-white border-toekn-white bg-transparent leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-toekn-orange hover:bg-toekn-dark-orange text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline w-[150px]"
        >
          {loading ? <Spinner size={25} color='#fff'/> : "Close Escrow"}
        </button>
      </div>
    </form>
  );
};

export default CloseEscrowForm;
