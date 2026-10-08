import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Verifyd } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

describe('Verifyd Smart Contract', function () {
  let verifyd: Verifyd;
  let issuer1: HardhatEthersSigner;
  let issuer2: HardhatEthersSigner;

  // Deterministic test document hash
  const TEST_DOC_HASH = '0x1111111111111111111111111111111111111111111111111111111111111111';
  const TEST_DOC_HASH_2 = '0x2222222222222222222222222222222222222222222222222222222222222222';
  const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const TEST_DOC_TYPE = 'degree_diploma';

  beforeEach(async function () {
    [issuer1, issuer2] = await ethers.getSigners();
    const VerifydFactory = await ethers.getContractFactory('Verifyd');
    verifyd = await VerifydFactory.deploy();
    await verifyd.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Contract deployment succeeds', async function () {
      const address = await verifyd.getAddress();
      expect(address).to.be.properAddress;
    });
  });

  describe('Document Registration', function () {
    it('A document can be registered successfully', async function () {
      await expect(
        verifyd.connect(issuer1).registerDocument(TEST_DOC_HASH, TEST_DOC_TYPE)
      ).to.not.be.reverted;
    });

    it('The correct issuer is recorded', async function () {
      await verifyd.connect(issuer1).registerDocument(TEST_DOC_HASH, TEST_DOC_TYPE);
      const doc = await verifyd.getDocument(TEST_DOC_HASH);
      expect(doc.issuer).to.equal(issuer1.address);
    });

    it('The correct document type is recorded', async function () {
      await verifyd.connect(issuer1).registerDocument(TEST_DOC_HASH, TEST_DOC_TYPE);
      const doc = await verifyd.getDocument(TEST_DOC_HASH);
      expect(doc.documentType).to.equal(TEST_DOC_TYPE);
    });

    it('A valid block timestamp is recorded', async function () {
      const tx = await verifyd.connect(issuer1).registerDocument(TEST_DOC_HASH, TEST_DOC_TYPE);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      const doc = await verifyd.getDocument(TEST_DOC_HASH);
      expect(doc.timestamp).to.equal(block!.timestamp);
      expect(doc.timestamp).to.be.greaterThan(0);
    });

    it('getDocument() returns the correct data matching registration', async function () {
      await verifyd.connect(issuer1).registerDocument(TEST_DOC_HASH, TEST_DOC_TYPE);
      const doc = await verifyd.getDocument(TEST_DOC_HASH);

      expect(doc.documentHash).to.equal(TEST_DOC_HASH);
      expect(doc.documentType).to.equal(TEST_DOC_TYPE);
      expect(doc.issuer).to.equal(issuer1.address);
      expect(doc.timestamp).to.be.greaterThan(0);
    });

    it('documentExists() returns true after registration', async function () {
      expect(await verifyd.documentExists(TEST_DOC_HASH)).to.be.false;
      await verifyd.connect(issuer1).registerDocument(TEST_DOC_HASH, TEST_DOC_TYPE);
      expect(await verifyd.documentExists(TEST_DOC_HASH)).to.be.true;
    });

    it('An unregistered hash returns false from documentExists()', async function () {
      expect(await verifyd.documentExists(TEST_DOC_HASH_2)).to.be.false;
    });

    it('getDocument() reverts with DocumentNotFound for an unregistered hash', async function () {
      await expect(verifyd.getDocument(TEST_DOC_HASH_2)).to.be.revertedWithCustomError(
        verifyd,
        'DocumentNotFound'
      );
    });

    it('The DocumentRegistered event is emitted correctly with expected arguments', async function () {
      const tx = await verifyd.connect(issuer1).registerDocument(TEST_DOC_HASH, TEST_DOC_TYPE);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      await expect(tx)
        .to.emit(verifyd, 'DocumentRegistered')
        .withArgs(TEST_DOC_HASH, TEST_DOC_TYPE, issuer1.address, block!.timestamp);
    });
  });

  describe('Validation & Edge Cases', function () {
    it('The zero/empty hash is rejected with InvalidDocumentHash', async function () {
      await expect(
        verifyd.connect(issuer1).registerDocument(ZERO_HASH, TEST_DOC_TYPE)
      ).to.be.revertedWithCustomError(verifyd, 'InvalidDocumentHash');
    });

    it('An empty document type is rejected with InvalidDocumentType', async function () {
      await expect(
        verifyd.connect(issuer1).registerDocument(TEST_DOC_HASH, '')
      ).to.be.revertedWithCustomError(verifyd, 'InvalidDocumentType');
    });

    it('The same hash cannot be registered twice (reverts with DocumentAlreadyRegistered)', async function () {
      // First registration succeeds
      await verifyd.connect(issuer1).registerDocument(TEST_DOC_HASH, TEST_DOC_TYPE);

      // Attempt by the same issuer fails
      await expect(
        verifyd.connect(issuer1).registerDocument(TEST_DOC_HASH, TEST_DOC_TYPE)
      ).to.be.revertedWithCustomError(verifyd, 'DocumentAlreadyRegistered');

      // Attempt by a different issuer also fails
      await expect(
        verifyd.connect(issuer2).registerDocument(TEST_DOC_HASH, 'legal_contract')
      ).to.be.revertedWithCustomError(verifyd, 'DocumentAlreadyRegistered');
    });

    it('Allows multiple distinct documents to be registered independently', async function () {
      await verifyd.connect(issuer1).registerDocument(TEST_DOC_HASH, 'degree_diploma');
      await verifyd.connect(issuer2).registerDocument(TEST_DOC_HASH_2, 'certificate');

      expect(await verifyd.documentExists(TEST_DOC_HASH)).to.be.true;
      expect(await verifyd.documentExists(TEST_DOC_HASH_2)).to.be.true;

      const doc1 = await verifyd.getDocument(TEST_DOC_HASH);
      const doc2 = await verifyd.getDocument(TEST_DOC_HASH_2);

      expect(doc1.issuer).to.equal(issuer1.address);
      expect(doc1.documentType).to.equal('degree_diploma');

      expect(doc2.issuer).to.equal(issuer2.address);
      expect(doc2.documentType).to.equal('certificate');
    });
  });
});
