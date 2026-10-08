export const verifydAbi = [
  {
    inputs: [],
    name: 'DocumentAlreadyRegistered',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DocumentNotFound',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidDocumentHash',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidDocumentType',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'documentHash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'documentType',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'issuer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'DocumentRegistered',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'documentHash',
        type: 'bytes32',
      },
    ],
    name: 'documentExists',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'documents',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'documentHash',
        type: 'bytes32',
      },
      {
        internalType: 'string',
        name: 'documentType',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'issuer',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'documentHash',
        type: 'bytes32',
      },
    ],
    name: 'getDocument',
    outputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'documentHash',
            type: 'bytes32',
          },
          {
            internalType: 'string',
            name: 'documentType',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'issuer',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
        ],
        internalType: 'struct Verifyd.Document',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'documentHash',
        type: 'bytes32',
      },
      {
        internalType: 'string',
        name: 'documentType',
        type: 'string',
      },
    ],
    name: 'registerDocument',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
