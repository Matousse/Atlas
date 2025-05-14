import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Constants
const BASE_YIELD = 2.15;
const MIN_YIELD = 2.0;
const MAX_YIELD = 2.5;
const BASE_VALIDATORS = 100;
const KILN_ORANGE = '#FF5D1F';
const KILN_API_URL = 'https://api.kiln.fi/v1/eth/stakes?page_size=25';

// Structure for orders
const initialOrders = {
  buy: [
    { id: 1, price: 32.0, amount: 1, total: 32.0, address: '0x789...abc', minYield: 2.5 },
    { id: 2, price: 31.5, amount: 1, total: 31.5, address: '0x891...2d5', minYield: 2.2 },
    { id: 3, price: 31.2, amount: 1, total: 31.2, address: '0x123...4f6', minYield: 2.0 },
  ],
  sell: []
};

// User data
const users = {
  'Team42': {
    username: 'Team42',
    reputation: 5.0,
    totalTransactions: 487,
    memberSince: '2023-01',
    description: 'Official platform team. Quality and reliability guaranteed.',
  },
  'crypto_whale': {
    username: 'crypto_whale',
    reputation: 4.7,
    totalTransactions: 312,
    memberSince: '2023-03',
    description: 'Major cryptocurrency investor, specialized in ETH validators',
  },
  'eth_master': {
    username: 'eth_master',
    reputation: 4.9,
    totalTransactions: 243,
    memberSince: '2023-02',
    description: 'Ethereum staking expert, focused on performance and stability',
  }
};

// NFTs available in the system
const initialNFTData = [
  {
    id: 1,
    name: 'Validator 1692397',
    price: 32.5,
    yield: 2.3,
    address: '0x456...7e8',
    description: 'A high-performance validator with an excellent history',
    history: [
      { date: '2024-01', price: 30.2 },
      { date: '2024-02', price: 31.5 },
      { date: '2024-03', price: 32.5 }
    ],
    commissionDate: '2024-01-15',
    forSale: true,
    bundleId: null,
    owner: 'crypto_whale',
    seller: 'crypto_whale',
    isBundle: false,
    platform: 'Kiln'
  },
  {
    id: 2,
    name: 'Validator 1456930',
    price: 31.8,
    yield: 2.1,
    address: '0x789...9a0',
    description: 'A stable validator with good performance',
    history: [
      { date: '2024-01', price: 29.8 },
      { date: '2024-02', price: 30.9 },
      { date: '2024-03', price: 31.8 }
    ],
    commissionDate: '2024-01-20',
    forSale: false,
    bundleId: null,
    owner: 'eth_master',
    seller: 'eth_master',
    isBundle: false,
    platform: 'Kiln'
  },
  {
    id: 5,
    name: 'Bundle Atlas',
    price: 65.0,
    nfts: [
      {
        id: 3,
        name: 'Validator 1442398',
        price: 33.5,
        yield: 2.2,
        address: '0xabc...def',
        description: 'First validator in the bundle',
        history: [
          { date: '2024-01', price: 31.5 },
          { date: '2024-02', price: 32.5 },
          { date: '2024-03', price: 33.5 }
        ],
        commissionDate: '2024-01-25',
        owner: 'eth_master',
        platform: 'Kiln'
      },
      {
        id: 4,
        name: 'Validator 1442399',
        price: 34.0,
        yield: 2.4,
        address: '0xdef...123',
        description: 'Second validator in the bundle',
        history: [
          { date: '2024-01', price: 32.0 },
          { date: '2024-02', price: 33.0 },
          { date: '2024-03', price: 34.0 }
        ],
        commissionDate: '2024-01-28',
        owner: 'eth_master',
        platform: 'Kiln'
      }
    ],
    isBundle: true,
    owner: 'eth_master',
    seller: 'eth_master',
    get yield() {
      return calculateBundleYield(this.nfts);
    },
    platform: 'Kiln'
  }
];

// Calculate the average yield for bundles
const calculateBundleYield = (nfts) => {
  if (!nfts || nfts.length === 0) return 0;
  const totalYield = nfts.reduce((sum, nft) => sum + nft.yield, 0);
  return totalYield / nfts.length;
};

// User's NFTs
const initialUserNFTs = [
  {
    id: 1,
    name: 'Validator 1692397',
    price: 32.5,
    yield: 2.3,
    address: '0x456...7e8',
    description: 'A high-performance validator with an excellent history',
    history: [
      { date: '2024-01', price: 30.2 },
      { date: '2024-02', price: 31.5 },
      { date: '2024-03', price: 32.5 }
    ],
    commissionDate: '2024-01-15',
    forSale: false,
    bundleId: null,
    platform: 'Kiln'
  },
  {
    id: 2,
    name: 'Validator 1456930',
    price: 31.8,
    yield: 2.1,
    address: '0x789...9a0',
    description: 'A stable validator with good performance',
    history: [
      { date: '2024-01', price: 29.8 },
      { date: '2024-02', price: 30.9 },
      { date: '2024-03', price: 31.8 }
    ],
    commissionDate: '2024-01-20',
    forSale: false,
    bundleId: null,
    platform: 'Kiln'
  },
  {
    id: 3,
    name: 'Validator 1442398',
    price: 31.2,
    yield: 2.2,
    address: '0xabc...def',
    description: 'A reliable validator with constant yield',
    history: [
      { date: '2024-01', price: 30.0 },
      { date: '2024-02', price: 30.8 },
      { date: '2024-03', price: 31.2 }
    ],
    commissionDate: '2024-01-25',
    forSale: false,
    bundleId: null,
    platform: 'Kiln'
  }
];

// Data for charts
const generateDailyData = () => {
  const data = [];
  const startDate = new Date('2024-01-01');
  const today = new Date();
  let accumulatedRewards = 0;
  
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dailyYield = 2.2 + (Math.random() * 0.2 - 0.1);
    const dailyReward = 0.05 + (Math.random() * 0.02 - 0.01);
    accumulatedRewards += dailyReward;
    
    data.push({
      date: d.toISOString().split('T')[0],
      yield: dailyYield,
      rewards: accumulatedRewards,
      totalValue: d < new Date('2024-01-15') ? 64 : 95.5
    });
  }
  return data;
};

const initialGraphData = generateDailyData();

// Sparkling effect with automatic animation and shooting stars
const StarryBackground = () => {
  const [stars, setStars] = useState([]);
  const [shootingStars, setShootingStars] = useState([]);

  useEffect(() => {
    const generateStars = () => {
      return [...Array(100)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 3 + 1,
        animationDuration: Math.random() * 2 + 1,
        animationDelay: Math.random() * 3,
        brightness: Math.random() * 0.5 + 0.5,
      }));
    };

    const generateShootingStar = () => ({
      id: Date.now(),
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      angle: Math.random() * 45 - 22.5, // -22.5 to +22.5 degrees
    });

    setStars(generateStars());
    const starsInterval = setInterval(() => {
      setStars(generateStars());
    }, 5000);

    const shootingStarInterval = setInterval(() => {
      setShootingStars(prev => [...prev, generateShootingStar()]);
      setTimeout(() => {
        setShootingStars(prev => prev.slice(1));
      }, 1000);
    }, 4000);

    return () => {
      clearInterval(starsInterval);
      clearInterval(shootingStarInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.animationDuration}s ease-in-out infinite`,
            animationDelay: `${star.animationDelay}s`,
            opacity: star.brightness,
          }}
        />
      ))}

      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="absolute w-1 h-1 bg-white rounded-full animate-shooting-star"
          style={{
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            transform: `rotate(${star.angle}deg)`,
          }}
        />
      ))}
    </div>
  );
};

const App = () => {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [section, setSection] = useState('marketplace');
  const [orders, setOrders] = useState(initialOrders);
  const [nfts, setNfts] = useState(initialNFTData);
  const [activeValidators, setActiveValidators] = useState(BASE_VALIDATORS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userNFTs, setUserNFTs] = useState(initialUserNFTs);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [editingOrder, setEditingOrder] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [expandedBundles, setExpandedBundles] = useState(new Set());
  const [selectedNFTsForSale, setSelectedNFTsForSale] = useState([]);
  const [bundlePrice, setBundlePrice] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [graphData] = useState(initialGraphData);
  const [selectedValidator, setSelectedValidator] = useState(null);
  const [currentNodePrice, setCurrentNodePrice] = useState(null);

  // Function to fetch validator data from Kiln API
  const fetchValidatorData = async () => {
    try {
      console.log('Fetching validator data from Kiln API...');
      const response = await fetch(KILN_API_URL, {
        headers: {
          'accept': 'application/json; charset=utf-8'
        }
      });
      console.log('API Response status:', response.status);
      const data = await response.json();
      console.log('API Response data:', data);
      
      if (data.data && data.data.length > 0) {
        const balanceInWei = BigInt(data.data[0].balance);
        const balanceInEth = Number(balanceInWei) / 10n**18n;
        console.log('Calculated ETH balance:', balanceInEth);
        return balanceInEth;
      }
      return null;
    } catch (error) {
      console.error('Error fetching validator data:', error);
      return null;
    }
  };

  // Fetch current node price on component mount
  useEffect(() => {
    console.log('useEffect triggered for price fetch');
    const getNodePrice = async () => {
      const price = await fetchValidatorData();
      console.log('Fetched price:', price);
      if (price) {
        setCurrentNodePrice(price);
        console.log('Updated currentNodePrice state:', price);
      }
    };
    getNodePrice();
  }, []);

  // Function to toggle the expansion of a bundle
  const toggleBundle = (bundleId) => {
    setExpandedBundles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bundleId)) {
        newSet.delete(bundleId);
      } else {
        newSet.add(bundleId);
      }
      return newSet;
    });
  };

  // Function to put NFTs up for sale
  const createSellOrder = () => {
    if (selectedNFTsForSale.length === 0 || !bundlePrice) return;

    const price = parseFloat(bundlePrice);
    const bundleId = Date.now();
    const averageYield = selectedNFTsForSale.reduce((sum, nft) => sum + nft.yield, 0) / selectedNFTsForSale.length;

    setUserNFTs(prev => prev.map(nft => {
      if (selectedNFTsForSale.find(selected => selected.id === nft.id)) {
        return {
          ...nft,
          forSale: true,
          bundleId,
          price: price / selectedNFTsForSale.length // Price per NFT in the bundle
        };
      }
      return nft;
    }));

    setSelectedNFTsForSale([]);
    setBundlePrice('');
  };

  // Function to get sell orders from NFTs
  const getSellOrders = useCallback(() => {
    const bundles = new Map();
    const singleNFTs = [];

    nfts.forEach(nft => {
      if (!nft.forSale) return;

      if (nft.bundleId) {
        if (!bundles.has(nft.bundleId)) {
          bundles.set(nft.bundleId, {
            id: nft.bundleId,
            price: 0,  // Will be calculated as the sum
            yield: 0,  // Will be calculated as the average
            isBundle: true,
            nfts: []
          });
        }
        const bundle = bundles.get(nft.bundleId);
        bundle.nfts.push(nft);
        bundle.price += nft.price;  // Sum of prices
        bundle.yield = bundle.nfts.reduce((sum, n) => sum + n.yield, 0) / bundle.nfts.length;  // Average of yields
      } else {
        singleNFTs.push(nft);
      }
    });

    return [...singleNFTs, ...Array.from(bundles.values())];
  }, [nfts]);

  // Component to display an NFT or a bundle
  const NFTDisplay = ({ nft }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (nft.isBundle) {
      return (
        <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div>
              <h3 className="text-white font-semibold">Bundle #{nft.id}</h3>
              <p className="text-gray-400">Total price: {nft.price} ETH</p>
              <p className="text-gray-400">Average yield: {nft.yield.toFixed(2)}%</p>
            </div>
            <button className="text-[#FF5D1F] text-xl">
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>
          
          {isExpanded && (
            <div className="mt-4 pl-4 space-y-2 border-l-2 border-[#FF5D1F]">
              {nft.nfts.map(bundleNft => (
                <div key={bundleNft.id} className="text-gray-400">
                  <div className="flex justify-between">
                    <span>{bundleNft.name}</span>
                    <span>Yield: {bundleNft.yield}%</span>
                  </div>
                  <p className="text-sm opacity-50">{bundleNft.address}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div 
        className="bg-gray-800 bg-opacity-50 p-4 rounded-lg cursor-pointer hover:bg-opacity-70 transition-all"
        onClick={() => setSelectedValidator(nft)}
      >
        <h3 className="text-white font-semibold">{nft.name || `NFT #${nft.id}`}</h3>
        <p className="text-gray-400">Price: {nft.price} ETH</p>
        <p className="text-gray-400">Yield: {nft.yield}%</p>
        <p className="text-sm text-gray-400 opacity-50">{nft.address}</p>
      </div>
    );
  };

  // Function to create a bundle
  const createBundle = (selectedNFTs, bundlePrice) => {
    if (!selectedNFTs.length || !bundlePrice) return;

    const bundleId = Date.now();
    const pricePerNFT = parseFloat(bundlePrice);

    setNfts(prev => {
      const updatedNFTs = prev.map(nft => {
        const selectedNFT = selectedNFTs.find(selected => selected.id === nft.id);
        if (selectedNFT) {
          return {
            ...nft,
            forSale: true,
            bundleId,
            price: pricePerNFT // Store the total bundle price in each NFT
          };
        }
        return nft;
      });
      return updatedNFTs;
    });
  };

  // Update sell orders when NFTs change
  useEffect(() => {
    setOrders(prev => ({
      ...prev,
      sell: getSellOrders()
    }));
  }, [nfts, getSellOrders]);

  // Component to display sell orders
  const OrderBook = () => {
    return (
      <div className="bg-black bg-opacity-50 p-6 rounded-xl border-2 border-[#FF5D1F] backdrop-blur-sm">
        <h2 className="text-xl text-[#FF5D1F] mb-4">Orderbook</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
            <h3 className="text-green-400 mb-2">Buy orders</h3>
            <div className="space-y-2">
              {orders.buy.map(order => (
                <div key={order.id} 
                  className="flex justify-between items-center text-white p-2 rounded hover:bg-[#FF5D1F] hover:bg-opacity-20 transition-all"
                >
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <span>{order.price} ETH</span>
                    <span>x{order.amount}</span>
                    <span>Min Yield: {order.minYield}%</span>
                    <span className="text-gray-400 text-sm">{order.address}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
            <h3 className="text-red-400 mb-2">Sell orders</h3>
            <div className="space-y-2">
              {orders.sell.map(order => {
                const matchingNFTs = nfts.filter(nft => 
                  nft.price === order.price && 
                  nft.yield === order.yield
                ).length;
                
                return (
                  <div key={order.id} 
                    className="flex justify-between items-center text-white p-2 rounded hover:bg-[#FF5D1F] hover:bg-opacity-20 transition-all"
                  >
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <span>{order.price} ETH</span>
                      <span>x{matchingNFTs}</span>
                      <span>Yield: {order.yield}%</span>
                      <span className="text-gray-400 text-sm">{order.address}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Update transaction logic to handle bundles
  const checkAndExecuteTransactions = useCallback(() => {
    const buyOrders = [...orders.buy];
    const sellOrders = getSellOrders();

    buyOrders.forEach(buyOrder => {
      const matchingSellOrder = sellOrders.find(sellOrder => 
        sellOrder.yield >= buyOrder.minYield && 
        sellOrder.price <= buyOrder.price
      );

      if (matchingSellOrder) {
        const transaction = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          buyOrder,
          sellOrder: matchingSellOrder,
          price: matchingSellOrder.price,
          yieldRatio: matchingSellOrder.yield
        };

        setUserNFTs(prev => prev.map(nft => {
          if (nft.id === matchingSellOrder.id) {
            return { ...nft, forSale: false, bundleId: null };
          }
          return nft;
        }));

        setTransactions(prev => [...prev, transaction]);
        setOrders(prev => ({
          ...prev,
          buy: prev.buy.filter(order => order.id !== buyOrder.id)
        }));
      }
    });
  }, [orders, getSellOrders]);

  // Check for transactions on every order change
  useEffect(() => {
    checkAndExecuteTransactions();
  }, [checkAndExecuteTransactions]);

  // Function to reset transaction history
  const resetTransactionHistory = () => {
    setTransactions([]);
  };

  // Component for transaction history
  const TransactionHistory = () => (
    <div className="bg-black bg-opacity-50 p-6 rounded-xl border-2 border-[#FF5D1F] backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-[#FF5D1F]">Transaction History</h2>
        {isAdmin && (
          <button
            onClick={resetTransactionHistory}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-opacity-80 transition-all"
          >
            Reset
          </button>
        )}
      </div>
      <div className="space-y-4">
        {transactions.map(transaction => (
          <div key={transaction.id} className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-[#FF5D1F]">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-white font-semibold">Buy order</h3>
                <p className="text-gray-300">Price: {transaction.buyOrder.price} ETH</p>
                <p className="text-gray-300">Quantity: {transaction.buyOrder.amount}</p>
                <p className="text-gray-300">Minimum yield: {transaction.buyOrder.minYield}%</p>
                <p className="text-gray-300">Buyer: {transaction.buyOrder.address}</p>
              </div>
              <div>
                <h3 className="text-white font-semibold">Sell orders</h3>
                <p>Price: {transaction.sellOrder.price} ETH - Yield: {transaction.sellOrder.yield}%</p>
                <p className="text-sm">Seller: {transaction.sellOrder.address}</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-[#FF5D1F]">Total: {transaction.price} ETH</p>
              <p className="text-[#FF5D1F]">Yield/Price: {transaction.yieldRatio.toFixed(4)}</p>
              <p className="text-gray-400 text-sm">
                {new Date(transaction.timestamp).toLocaleString('en-US', { 
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="text-gray-400 text-center">No transactions</p>
        )}
      </div>
    </div>
  );

  const calculateYield = (baseYield) => {
    const ratio = BASE_VALIDATORS / activeValidators;
    let newYield = baseYield * ratio;
    return Math.max(MIN_YIELD, Math.min(MAX_YIELD, newYield));
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedNFTs = () => {
    const sortedNFTs = [...nfts];
    if (sortConfig.key) {
      sortedNFTs.sort((a, b) => {
        if (sortConfig.key === 'yieldPrice') {
          const aValue = a.yield / a.price;
          const bValue = b.yield / b.price;
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
    }
    return sortedNFTs;
  };

  const calculateUserStats = () => {
    const totalValue = userNFTs.reduce((acc, nft) => acc + nft.price, 0);
    const averageYield = userNFTs.length > 0 
      ? userNFTs.reduce((sum, nft) => sum + nft.yield, 0) / userNFTs.length 
      : 0;
    return { totalValue, totalYield: averageYield };
  };

  const handleEditOrder = (type, order) => {
    setEditingOrder({ ...order, type });
  };

  const handleDeleteOrder = (type, orderId) => {
    setOrders(prev => ({
      ...prev,
      [type]: prev[type].filter(order => order.id !== orderId)
    }));
  };

  const handleUpdateOrder = (updatedOrder) => {
    setOrders(prev => ({
      ...prev,
      [updatedOrder.type]: prev[updatedOrder.type].map(order => 
        order.id === updatedOrder.id ? {
          ...order,
          price: parseFloat(updatedOrder.price),
          amount: parseInt(updatedOrder.amount),
          total: parseFloat(updatedOrder.price) * parseInt(updatedOrder.amount),
          ...(updatedOrder.type === 'buy' ? { minYield: parseFloat(updatedOrder.minYield) } : { yield: parseFloat(updatedOrder.yield) })
        } : order
      )
    }));
    setEditingOrder(null);
  };

  // Admin Panel with adding vNFTs and managing orders
  const AdminPanel = () => {
    const [newNFT, setNewNFT] = useState({
      name: '',
      description: '',
      price: '',
      yield: BASE_YIELD
    });
    const [newOrder, setNewOrder] = useState({
      type: 'buy',
      price: '',
      amount: 1,
      minYield: BASE_YIELD,
      yield: BASE_YIELD
    });

    const addNFT = () => {
      const nftToAdd = {
        id: nfts.length + 1,
        ...newNFT,
        price: parseFloat(newNFT.price),
        circulation: 50,
        history: [{ date: '2024-02', price: parseFloat(newNFT.price) }],
        platform: 'Kiln' // Default platform
      };
      setNfts([...nfts, nftToAdd]);
      setNewNFT({ name: '', description: '', price: '', yield: BASE_YIELD });
    };

    const addOrder = () => {
      const newOrderObj = {
        id: Date.now(),
        price: parseFloat(newOrder.price),
        amount: parseInt(newOrder.amount),
        total: parseFloat(newOrder.price) * parseInt(newOrder.amount),
        address: '0x' + Math.random().toString(16).substr(2, 10)
      };

      if (newOrder.type === 'buy') {
        newOrderObj.minYield = parseFloat(newOrder.minYield);
      } else {
        newOrderObj.yield = parseFloat(newOrder.yield);
      }

      setOrders(prev => ({
        ...prev,
        [newOrder.type]: [...prev[newOrder.type], newOrderObj]
      }));
      setNewOrder({ type: 'buy', price: '', amount: 1, minYield: BASE_YIELD, yield: BASE_YIELD });
    };

    return (
      <div className="bg-black bg-opacity-50 p-6 rounded-xl border-2 border-[#FF5D1F] backdrop-blur-sm">
        <h2 className="text-xl text-[#FF5D1F] mb-4">Admin Panel</h2>
        
        {editingOrder ? (
          <div className="mb-6 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
            <h3 className="text-white mb-4">Edit {editingOrder.type === 'buy' ? "buy" : 'sell'} order</h3>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Price (ETH)"
                value={editingOrder.price}
                onChange={(e) => setEditingOrder({...editingOrder, price: e.target.value})}
                className="w-full p-2 rounded bg-black text-white border-2 border-[#FF5D1F] focus:ring-2 focus:ring-[#FF5D1F]"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={editingOrder.amount}
                onChange={(e) => setEditingOrder({...editingOrder, amount: e.target.value})}
                className="w-full p-2 rounded bg-black text-white border-2 border-[#FF5D1F] focus:ring-2 focus:ring-[#FF5D1F]"
              />
              {editingOrder.type === 'buy' ? (
                <input
                  type="number"
                  step="0.1"
                  placeholder="Minimum yield (%)"
                  value={editingOrder.minYield}
                  onChange={(e) => setEditingOrder({...editingOrder, minYield: e.target.value})}
                  className="w-full p-2 rounded bg-black text-white border-2 border-[#FF5D1F] focus:ring-2 focus:ring-[#FF5D1F]"
                />
              ) : (
                <input
                  type="number"
                  step="0.1"
                  placeholder="Yield (%)"
                  value={editingOrder.yield}
                  onChange={(e) => setEditingOrder({...editingOrder, yield: e.target.value})}
                  className="w-full p-2 rounded bg-black text-white border-2 border-[#FF5D1F] focus:ring-2 focus:ring-[#FF5D1F]"
                />
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdateOrder(editingOrder)}
                  className="flex-1 px-4 py-2 bg-[#FF5D1F] text-white rounded hover:bg-opacity-80 transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 border-2 border-[#FF5D1F] text-[#FF5D1F] rounded hover:bg-[#FF5D1F] hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-white block mb-2">Active validators</label>
                <input
                  type="number"
                  value={activeValidators}
                  onChange={(e) => setActiveValidators(parseInt(e.target.value))}
                  className="w-full p-2 rounded bg-black text-white border-2 border-[#FF5D1F] focus:ring-2 focus:ring-[#FF5D1F]"
                />
              </div>
              <div>
                <label className="text-white block mb-2">New order</label>
                <div className="space-y-2">
                  <select
                    value={newOrder.type}
                    onChange={(e) => setNewOrder({...newOrder, type: e.target.value})}
                    className="w-full p-2 rounded bg-black text-white border-2 border-[#FF5D1F] focus:ring-2 focus:ring-[#FF5D1F]"
                  >
                    <option value="buy">Buy Order</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price (ETH)"
                    value={newOrder.price}
                    onChange={(e) => setNewOrder({...newOrder, price: e.target.value})}
                    className="w-full p-2 rounded bg-black text-white border-2 border-[#FF5D1F] focus:ring-2 focus:ring-[#FF5D1F]"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={newOrder.amount}
                    onChange={(e) => setNewOrder({...newOrder, amount: e.target.value})}
                    className="w-full p-2 rounded bg-black text-white border-2 border-[#FF5D1F] focus:ring-2 focus:ring-[#FF5D1F]"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Minimum yield (%)"
                    value={newOrder.minYield}
                    onChange={(e) => setNewOrder({...newOrder, minYield: e.target.value})}
                    className="w-full p-2 rounded bg-black text-white border-2 border-[#FF5D1F] focus:ring-2 focus:ring-[#FF5D1F]"
                  />
                  <button
                    onClick={addOrder}
                    className="w-full px-4 py-2 bg-[#FF5D1F] text-white rounded hover:bg-opacity-80"
                  >
                    Add Buy Order
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-white">Add NFT</h3>
              <input
                placeholder="NFT Name"
                value={newNFT.name}
                onChange={(e) => setNewNFT({...newNFT, name: e.target.value})}
                className="w-full p-2 rounded bg-black text-white border-2 border-[#FF5D1F] focus:ring-2 focus:ring-[#FF5D1F]"
              />
              <input
                placeholder="Description"
                value={newNFT.description}
                onChange={(e) => setNewNFT({...newNFT, description: e.target.value})}
                className="w-full p-2 rounded bg-black text-white border-2 border-[#FF5D1F] focus:ring-2 focus:ring-[#FF5D1F]"
              />
              <input
                type="number"
                placeholder="Price (ETH)"
                value={newNFT.price}
                onChange={(e) => setNewNFT({...newNFT, price: e.target.value})}
                className="w-full p-2 rounded bg-black text-white border-2 border-[#FF5D1F] focus:ring-2 focus:ring-[#FF5D1F]"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Base yield (%)"
                value={newNFT.yield}
                onChange={(e) => setNewNFT({...newNFT, yield: e.target.value})}
                className="w-full p-2 rounded bg-black text-white border-2 border-[#FF5D1F] focus:ring-2 focus:ring-[#FF5D1F]"
              />
              <button
                onClick={addNFT}
                className="w-full px-4 py-2 bg-[#FF5D1F] text-white rounded hover:bg-opacity-80"
              >
                Add NFT
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Restored and improved profile
  const Profile = () => {
    const [selectedNFTs, setSelectedNFTs] = useState([]);
    const [bundlePrice, setBundlePrice] = useState('');
    const [saleType, setSaleType] = useState('single');
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [singlePrice, setSinglePrice] = useState('');
    const [graphView, setGraphView] = useState('yield');

    const calculateUserStats = () => {
      const totalValue = userNFTs.reduce((sum, nft) => sum + nft.price, 0);
      const averageYield = userNFTs.length > 0 
        ? userNFTs.reduce((sum, nft) => sum + nft.yield, 0) / userNFTs.length 
        : 0;
      return { totalValue, totalYield: averageYield };
    };

    const getGraphTitle = () => {
      switch (graphView) {
        case 'yield':
          return 'Yield Evolution (%)';
        case 'value':
          return 'Total Value Evolution (ETH)';
        case 'rewards':
          return 'Cumulative Rewards (ETH)';
        default:
          return '';
      }
    };

    const getGraphData = () => {
      return graphData.map(d => ({
        ...d,
        value: graphView === 'yield' ? d.yield :
               graphView === 'value' ? (new Date(d.date) < new Date('2024-01-15') ? 64 : 95.5) :
               d.rewards
      }));
    };

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setGraphView('yield')}
            className={`p-6 rounded-lg border transition-all ${
              graphView === 'yield'
                ? 'bg-[#FF5D1F] bg-opacity-20 border-[#FF5D1F]'
                : 'bg-black bg-opacity-50 border-gray-700 hover:border-[#FF5D1F]'
            }`}
          >
            <h3 className="text-lg font-semibold text-white mb-2">Average Yield</h3>
            <p className="text-3xl font-bold text-[#FF5D1F]">
              {calculateUserStats().totalYield.toFixed(2)}%
            </p>
          </button>

          <button
            onClick={() => setGraphView('value')}
            className={`p-6 rounded-lg border transition-all ${
              graphView === 'value'
                ? 'bg-[#FF5D1F] bg-opacity-20 border-[#FF5D1F]'
                : 'bg-black bg-opacity-50 border-gray-700 hover:border-[#FF5D1F]'
            }`}
          >
            <h3 className="text-lg font-semibold text-white mb-2">Total Value</h3>
            <p className="text-3xl font-bold text-[#FF5D1F]">
              {calculateUserStats().totalValue.toFixed(2)} ETH
            </p>
          </button>

          <button
            onClick={() => setGraphView('rewards')}
            className={`p-6 rounded-lg border transition-all ${
              graphView === 'rewards'
                ? 'bg-[#FF5D1F] bg-opacity-20 border-[#FF5D1F]'
                : 'bg-black bg-opacity-50 border-gray-700 hover:border-[#FF5D1F]'
            }`}
          >
            <h3 className="text-lg font-semibold text-white mb-2">Total Rewards</h3>
            <p className="text-3xl font-bold text-[#FF5D1F]">
              {graphData[graphData.length - 1].rewards.toFixed(2)} ETH
            </p>
          </button>
        </div>

        {/* Graph */}
        <div className="bg-black bg-opacity-50 p-6 rounded-xl border-2 border-[#FF5D1F]">
          <h2 className="text-xl text-[#FF5D1F] mb-4">{getGraphTitle()}</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getGraphData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FF5D1F" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  stroke="#FF5D1F"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  stroke="#FF5D1F"
                  domain={graphView === 'yield' ? [2, 2.4] : 
                         graphView === 'value' ? [60, 100] : 
                         ['auto', 'auto']}
                  tickFormatter={(value) => graphView === 'yield' ? `${value}%` : `${value.toFixed(2)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid #FF5D1F',
                    borderRadius: '4px'
                  }}
                  labelStyle={{ color: '#FF5D1F' }}
                  formatter={(value) => [
                    graphView === 'yield' ? `${value.toFixed(2)}%` : `${value.toFixed(2)} ETH`,
                    graphView === 'yield' ? 'Yield' : graphView === 'value' ? 'Value' : 'Rewards'
                  ]}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                />
                <Line
                  type={graphView === 'value' ? 'step' : 'monotone'}
                  dataKey="value"
                  stroke="#FF5D1F"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NFTs List */}
        <div className="bg-black bg-opacity-50 p-6 rounded-xl border-2 border-[#FF5D1F]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-[#FF5D1F]">My NFTs</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setSaleType('single');
                  setSelectedNFTs([]);
                  setSelectedNFT(null);
                  setSinglePrice('');
                }}
                className={`px-4 py-2 rounded transition-all ${
                  saleType === 'single'
                    ? 'bg-[#FF5D1F] text-white'
                    : 'text-[#FF5D1F] hover:bg-[#FF5D1F] hover:bg-opacity-20'
                }`}
              >
                Single Sale
              </button>
              <button
                onClick={() => {
                  setSaleType('bundle');
                  setSelectedNFT(null);
                  setSinglePrice('');
                }}
                className={`px-4 py-2 rounded transition-all ${
                  saleType === 'bundle'
                    ? 'bg-[#FF5D1F] text-white'
                    : 'text-[#FF5D1F] hover:bg-[#FF5D1F] hover:bg-opacity-20'
                }`}
              >
                Create Bundle
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {userNFTs.map(nft => (
              <div key={nft.id} className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-semibold">{nft.name}</h3>
                    <p className="text-gray-400">Yield: {nft.yield}%</p>
                    <p className="text-gray-400">Price: {nft.price} ETH</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {nft.forSale ? (
                      <button
                        onClick={() => handleCancelSale(nft.bundleId || nft.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Remove from sale
                      </button>
                    ) : saleType === 'bundle' ? (
                      <input
                        type="checkbox"
                        checked={selectedNFTs.some(selected => selected.id === nft.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNFTs(prev => [...prev, nft]);
                          } else {
                            setSelectedNFTs(prev => prev.filter(selected => selected.id !== nft.id));
                          }
                        }}
                        className="form-checkbox h-5 w-5 text-[#FF5D1F]"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedNFT(nft);
                          setSinglePrice(nft.price.toString());
                        }}
                        className="px-3 py-1 text-[#FF5D1F] hover:bg-[#FF5D1F] hover:bg-opacity-20 rounded"
                      >
                        Put on sale
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Single Sale Form */}
        {saleType === 'single' && selectedNFT && (
          <div className="bg-black bg-opacity-50 p-6 rounded-xl border-2 border-[#FF5D1F]">
            <h2 className="text-xl text-[#FF5D1F] mb-4">Put {selectedNFT.name} on sale</h2>
            <div className="space-y-4">
              <div>
                <label className="text-white block mb-2">Sale price</label>
                <input
                  type="number"
                  value={singlePrice}
                  onChange={(e) => setSinglePrice(e.target.value)}
                  className="w-full p-2 rounded bg-black text-white border-2 border-[#FF5D1F] focus:ring-2 focus:ring-[#FF5D1F]"
                  placeholder="Price in ETH"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setSelectedNFT(null);
                    setSinglePrice('');
                  }}
                  className="px-4 py-2 text-[#FF5D1F] hover:bg-[#FF5D1F] hover:bg-opacity-20 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSingleSaleSubmit}
                  className="px-4 py-2 bg-[#FF5D1F] text-white rounded hover:bg-opacity-80"
                >
                  Put on sale
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bundle Creation Form */}
        {saleType === 'bundle' && selectedNFTs.length > 0 && (
          <div className="bg-black bg-opacity-50 p-6 rounded-xl border-2 border-[#FF5D1F]">
            <h2 className="text-xl text-[#FF5D1F] mb-4">Create a bundle</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white mb-2">Selected NFTs:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedNFTs.map(nft => (
                    <div key={nft.id} className="text-gray-400">
                      {nft.name} (Yield: {nft.yield}%)
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white block mb-2">Total bundle price</label>
                <input
                  type="number"
                  value={bundlePrice}
                  onChange={(e) => setBundlePrice(e.target.value)}
                  className="w-full p-2 rounded bg-black text-white border-2 border-[#FF5D1F] focus:ring-2 focus:ring-[#FF5D1F]"
                  placeholder="Price in ETH"
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-gray-400">
                  Average yield: {(selectedNFTs.reduce((sum, nft) => sum + nft.yield, 0) / selectedNFTs.length).toFixed(2)}%
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedNFTs([]);
                      setBundlePrice('');
                    }}
                    className="px-4 py-2 text-[#FF5D1F] hover:bg-[#FF5D1F] hover:bg-opacity-20 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateBundle}
                    className="px-4 py-2 bg-[#FF5D1F] text-white rounded hover:bg-opacity-80"
                  >
                    Create Bundle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Component to display user profile in a popup
  const UserProfilePopup = ({ username, onClose }) => {
    const user = users[username];
    if (!user) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-6 rounded-xl border-2 border-[#FF5D1F] max-w-md w-full mx-4">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl text-[#FF5D1F] font-bold">{user.username}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="text-3xl text-[#FF5D1F] font-bold">{user.reputation}</div>
              <div className="ml-2 text-yellow-500">
                {'★'.repeat(Math.floor(user.reputation))}
                {user.reputation % 1 > 0 ? '½' : ''}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black bg-opacity-50 p-3 rounded">
                <div className="text-gray-400 text-sm">Transactions</div>
                <div className="text-white font-bold">{user.totalTransactions}</div>
              </div>
            </div>

            <div>
              <div className="text-gray-400 text-sm">Description</div>
              <div className="text-white">{user.description}</div>
            </div>

            <div>
              <div className="text-gray-400 text-sm">Member since</div>
              <div className="text-white">{user.memberSince}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Function to put an NFT up for sale
  const handleSingleSale = (nft, price) => {
    setNfts(currentNfts => currentNfts.map(n => {
      if (n.id === nft.id) {
        return {
          ...n,
          forSale: true,
          price: parseFloat(price),
          bundleId: null,
          seller: 'Team42' // When putting up for sale from the profile
        };
      }
      return n;
    }));
  };

  useEffect(() => {
    setNfts(prev => prev.map(nft => ({ ...nft, forSale: true })));
  }, []);

  // Function to cancel a sale
  const handleCancelSale = (nftId) => {
    setNfts(currentNfts => currentNfts.map(nft => {
      // If it's an individual NFT or if it's an NFT in a bundle
      if (nft.id === nftId || nft.bundleId === nftId) {
        return {
          ...nft,
          forSale: false,
          bundleId: null
        };
      }
      return nft;
    }));
  };

  // Bundles available
  const bundles = [
    {
      id: 1,
      name: 'Bundle',
      price: 95.5,
      yield: 6.6,
      validators: [
        {
          id: 1,
          name: 'Validator 1692397',
          price: 32.5,
          yield: 2.3
        },
        {
          id: 2,
          name: 'Validator 1456930',
          price: 31.8,
          yield: 2.1
        },
        {
          id: 3,
          name: 'Validator 1442398',
          price: 31.2,
          yield: 2.2
        }
      ]
    }
  ];

  // Component for the NFT card
  const NFTCard = ({ validator, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-gradient-to-br from-[#FF5D1F] to-black p-[1px] rounded-xl w-80" onClick={e => e.stopPropagation()}>
          <div className="bg-black rounded-lg p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">{validator.name.split(' ')[0]}</span>
                <span className="text-xl text-gray-400">#{validator.name.split(' ')[1]}</span>
              </div>
              <img src="/kiln.png" alt="Kiln Logo" className="h-14 w-auto mx-1 mt-2" />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-gray-400 text-xs mb-1">Staked Balance</div>
                <div className="bg-black rounded px-3 py-2 text-white font-medium border border-[#FF5D1F] border-opacity-20">
                  32 ETH
                </div>
              </div>
              
              <div>
                <div className="text-gray-400 text-xs mb-1">Rewards (Est.)</div>
                <div className="bg-black rounded px-3 py-2 text-white font-medium border border-[#FF5D1F] border-opacity-20">
                  {validator.yield}% APR
                </div>
              </div>

              <div>
                <div className="text-gray-400 text-xs mb-1">Price</div>
                <div className="bg-black rounded px-3 py-2 text-white font-medium border border-[#FF5D1F] border-opacity-20">
                  {validator.price} ETH
                </div>
              </div>

              <div>
                <div className="text-gray-400 text-xs mb-1">Est. Queue Time</div>
                <div className="bg-black rounded px-3 py-2 text-white font-medium border border-[#FF5D1F] border-opacity-20">
                  ~4 months
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#FF5D1F] border-opacity-20">
              <div className="text-sm text-gray-400">
                <span className="text-[#FF5D1F]">●</span> Active
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // Buy logic here
                }}
                className="px-6 py-2 bg-[#FF5D1F] text-white rounded-lg hover:bg-opacity-80 transition-all"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black relative">
      <StarryBackground />
      {selectedValidator && (
        <NFTCard 
          validator={selectedValidator} 
          onClose={() => setSelectedValidator(null)} 
        />
      )}
      
      <nav className="bg-black border-b border-[#FF5D1F]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8 items-center">
              <div className="flex items-center space-x-2">
                <svg className="w-10 h-10 text-[#FF5D1F]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>
                </svg>
                <h1 className="text-3xl font-bold text-[#FF5D1F] animate-pulse">Atlas</h1>
              </div>
              <button 
                onClick={() => setSection('marketplace')}
                className={`px-4 py-2 rounded transition-all ${
                  section === 'marketplace' 
                    ? 'bg-[#FF5D1F] text-white' 
                    : 'text-[#FF5D1F] hover:bg-[#FF5D1F] hover:bg-opacity-20'
                }`}
              >
                Marketplace
              </button>
              <button 
                onClick={() => setSection('profile')}
                className={`px-4 py-2 rounded transition-all ${
                  section === 'profile' 
                    ? 'bg-[#FF5D1F] text-white' 
                    : 'text-[#FF5D1F] hover:bg-[#FF5D1F] hover:bg-opacity-20'
                }`}
              >
                Profile
              </button>
              <button 
                onClick={() => setSection('history')}
                className={`px-4 py-2 rounded transition-all ${
                  section === 'history' 
                    ? 'bg-[#FF5D1F] text-white' 
                    : 'text-[#FF5D1F] hover:bg-[#FF5D1F] hover:bg-opacity-20'
                }`}
              >
                History
              </button>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => setIsAdmin(!isAdmin)}
                className="bg-black text-[#FF5D1F] px-4 py-2 rounded border border-[#FF5D1F] hover:bg-[#FF5D1F] hover:text-white transition-all"
              >
                {isAdmin ? 'Exit Admin' : 'Admin'}
              </button>
              <button className="bg-[#FF5D1F] text-white px-6 py-2 rounded hover:bg-opacity-80 transition-all">
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        {isAdmin && <AdminPanel />}
        
        {section === 'marketplace' ? (
          <>
            <OrderBook />
            <div className="mt-8">
              <h2 className="text-xl text-[#FF5D1F] mb-4">Available NFTs</h2>
              {currentNodePrice && (
                <div className="mb-4 p-4 bg-black bg-opacity-50 rounded-lg border border-[#FF5D1F]">
                  <span className="text-white">Current Node Price: </span>
                  <span className="text-[#FF5D1F] font-bold">
                    {currentNodePrice ? `${currentNodePrice.toFixed(4)} ETH` : 'Loading...'}
                  </span>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full border-2 border-[#FF5D1F] rounded-lg">
                  <thead>
                    <tr className="bg-[#FF5D1F] bg-opacity-20">
                      <th className="p-3 text-left text-white cursor-pointer hover:bg-[#FF5D1F] hover:bg-opacity-30" 
                          onClick={() => handleSort('name')}>
                        Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                      </th>
                      <th className="p-3 text-left text-white cursor-pointer hover:bg-[#FF5D1F] hover:bg-opacity-30" 
                          onClick={() => handleSort('price')}>
                        Price {sortConfig.key === 'price' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                      </th>
                      <th className="p-3 text-left text-white cursor-pointer hover:bg-[#FF5D1F] hover:bg-opacity-30" 
                          onClick={() => handleSort('yield')}>
                        Yield {sortConfig.key === 'yield' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                      </th>
                      <th className="p-3 text-left text-white cursor-pointer hover:bg-[#FF5D1F] hover:bg-opacity-30" 
                          onClick={() => handleSort('yieldPrice')}>
                        Yield/Price {sortConfig.key === 'yieldPrice' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                      </th>
                      <th className="p-3 text-left text-white">
                        Platform
                      </th>
                      <th className="p-3 text-left text-white">
                        Holder
                      </th>
                      <th className="p-3 text-left text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedNFTs().map((nft) => (
                      <React.Fragment key={nft.id}>
                        <tr className="border-t border-[#FF5D1F] hover:bg-[#FF5D1F] hover:bg-opacity-10">
                          <td className="p-3 text-white">
                            {nft.isBundle ? (
                              <div className="flex items-center">
                                <span>Bundle #{nft.id}</span>
                                <button 
                                  onClick={() => {
                                    const row = document.getElementById(`bundle-${nft.id}`);
                                    if (row) row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
                                  }}
                                  className="ml-2 text-[#FF5D1F]"
                                >
                                  ▼
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedValidator(nft)}
                                className="text-white hover:text-[#FF5D1F] transition-colors"
                              >
                                {nft.name}
                              </button>
                            )}
                          </td>
                          <td className="p-3 text-white">{nft.price} ETH</td>
                          <td className="p-3 text-white">{nft.yield}%</td>
                          <td className="p-3 text-white">{(nft.yield / nft.price).toFixed(4)}</td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <img src="/kiln.png" alt="Kiln Logo" className="h-6 w-auto" />
                            </div>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => setSelectedUser(nft.isBundle ? nft.nfts[0].owner : nft.owner)}
                              className="text-[#FF5D1F] hover:text-white transition-colors"
                            >
                              {nft.isBundle ? nft.nfts[0].owner : nft.owner}
                              <span className="ml-2 text-yellow-500">
                                {'★'.repeat(Math.floor(users[nft.isBundle ? nft.nfts[0].owner : nft.owner].reputation))}
                              </span>
                            </button>
                          </td>
                          <td className="p-3 text-white">
                            <button
                              onClick={() => setSelectedValidator(nft)}
                              className="text-[#FF5D1F] hover:text-white transition-colors"
                            >
                              Buy
                            </button>
                          </td>
                        </tr>
                        {nft.isBundle && (
                          <tr id={`bundle-${nft.id}`} className="bg-gray-800 bg-opacity-50" style={{display: 'none'}}>
                            <td colSpan="7" className="p-4">
                              <div className="pl-4 space-y-2 border-l-2 border-[#FF5D1F]">
                                {nft.nfts.map(bundleNft => (
                                  <div key={bundleNft.id} className="grid grid-cols-7 text-gray-400 items-center">
                                    <button
                                      onClick={() => setSelectedValidator(bundleNft)}
                                      className="text-gray-400 hover:text-[#FF5D1F] transition-colors"
                                    >
                                      {bundleNft.name}
                                    </button>
                                    <div></div>
                                    <div>{bundleNft.yield}%</div>
                                    <div className="col-span-4"></div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : section === 'history' ? (
          <TransactionHistory />
        ) : (
          <Profile />
        )}
      </main>

      {selectedUser && (
        <UserProfilePopup
          username={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default App;