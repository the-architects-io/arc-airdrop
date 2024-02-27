export const generateFakeMetadatas = (amountToGenerate = 20) => {
  function generateRandomElement(array: any) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function generateFakeNft(nftNumber: number) {
    const backgrounds = ["red", "blue", "green", "yellow", "purple"];
    const adjectives = [
      "sparkly",
      "shiny",
      "smooth",
      "obtuse",
      "delinquent",
      "prickly",
      "silly",
      "sassy",
      "salty",
      "sour",
      "sweet",
      "sour",
      "salty",
      "smokey",
      "balmy",
    ];
    return {
      name: `NFT #${nftNumber}`,
      symbol: "WLY",
      description: "WARLY LOVES YOU",
      seller_fee_basis_points: 4200,
      image: `${nftNumber}.png`,
      external_url: "https://the-architects.io/",
      edition: nftNumber,
      collection: {
        name: "Warly Loves You",
        family: "Warly Loves You",
      },
      attributes: [
        {
          trait_type: "backgrounds",
          value: generateRandomElement(backgrounds),
        },
        { trait_type: "adjective", value: generateRandomElement(adjectives) },
        // { trait_type: "labels", value: generateRandomElement(labels) },
        // { trait_type: "details", value: generateRandomElement(details) },
      ],
      properties: {
        files: [
          {
            uri: `${nftNumber}.png`,
            type: "image/png",
          },
        ],
        category: "image",
        creators: [
          {
            address: "44Cv2k5kFRzGQwBLEBc6aHHTwTvEReyeh4PHMH1cBgAe",
            share: 100,
          },
        ],
      },
    };
  }

  const nftArray = [];
  for (let i = 0; i < amountToGenerate; i++) {
    nftArray.push(generateFakeNft(i));
  }

  return JSON.parse(JSON.stringify(nftArray, null, 2));
};
