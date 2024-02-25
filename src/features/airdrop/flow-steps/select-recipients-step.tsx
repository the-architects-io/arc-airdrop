import { PlusCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState } from "react";

export const SelectRecipientsStep = () => {
  const [recipientCount, setRecipientCount] = useState(15000);

  const collections = [
    {
      name: "collection 1",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 2",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 3",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 4",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 5",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 6",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 7",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 8",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 9",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 10",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 11",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 12",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 13",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 14",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 15",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 16",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 17",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 18",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 19",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 20",
      image: "https://picsum.photos/200",
    },
  ];

  return (
    <>
      <div className="text-3xl mt-16 mb-8 font-heavy">
        choose your recipients
      </div>

      <div className="mb-8 font-heavy flex items-center">
        <span className="text-red-400 text-3xl mr-3">{recipientCount} </span>
        <div>recipients selected</div>
      </div>
      <div className="flex flex-wrap gap-y-4">
        <div className="w-1/2 sm:w-1/3 lg:w-1/4 flex flex-col items-center justify-center mb-4">
          <div className="w-48 h-48 bg-gray-400 text-gray-100 flex flex-col justify-center items-center text-center text-3xl p-2 transition-all hover:bg-cyan-400 cursor-pointer hover:scale-[1.05] rounded-md">
            <div className="mb-2">upload your own hashlist</div>
            <PlusCircleIcon className="w-12 h-12" />
          </div>
        </div>
        {collections.map((collection, index) => (
          <div
            key={index}
            className="w-1/2 sm:w-1/3 lg:w-1/4 flex flex-col items-center justify-center mb-4"
          >
            <div className="w-48 h-48 relative cursor-pointer hover:scale-[1.05] transition-transform duration-300 ease-in-out">
              <Image
                className="rounded-md"
                src={collection.image}
                alt={collection.name}
                layout="fill"
                objectFit="cover"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
