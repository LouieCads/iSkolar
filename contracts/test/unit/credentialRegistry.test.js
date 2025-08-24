const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("CredentialRegistry Unit Tests", function () {
      let credentialRegistry;
      let deployer, school1, school2, student1, student2, randomUser;
      let deployerSigner, school1Signer, school2Signer;

      const ISSUER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ISSUER_ROLE"));
      const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

      // Sample test data
      const sampleCredentials = {
        docHash1: ethers.keccak256(ethers.toUtf8Bytes("transcript_data_1")),
        docHash2: ethers.keccak256(ethers.toUtf8Bytes("certificate_data_1")),
        schema1: "transcript",
        schema2: "certificate",
        metadataURI1: "ipfs://QmTestHash1",
        metadataURI2: "ipfs://QmTestHash2",
      };

      beforeEach(async function () {
        // Get signers
        const accounts = await ethers.getSigners();
        deployerSigner = accounts[0];
        school1Signer = accounts[1];
        school2Signer = accounts[2];

        // Get named accounts
        const namedAccounts = await getNamedAccounts();
        deployer = namedAccounts.deployer;

        // Assign addresses
        school1 = school1Signer.address;
        school2 = school2Signer.address;
        student1 = accounts[3].address;
        student2 = accounts[4].address;
        randomUser = accounts[5].address;

        // Deploy contracts using hardhat-deploy
        await deployments.fixture(["credential-registry"]);

        // Get contract instance
        const credentialRegistryDeployment = await deployments.get(
          "CredentialRegistry"
        );
        credentialRegistry = await ethers.getContractAt(
          "CredentialRegistry",
          credentialRegistryDeployment.address,
          deployerSigner
        );
      });

      describe("Deployment", function () {
        it("Should deploy with correct admin role", async function () {
          expect(await credentialRegistry.hasRole(DEFAULT_ADMIN_ROLE, deployer))
            .to.be.true;
        });

        it("Should not grant issuer role to admin by default", async function () {
          expect(await credentialRegistry.hasRole(ISSUER_ROLE, deployer)).to.be
            .false;
        });

        it("Should start with zero credentials", async function () {
          expect(await credentialRegistry.getTotalCredentials()).to.equal(0);
        });

        it("Should revert if deployed with zero address admin", async function () {
          const CredentialRegistryFactory = await ethers.getContractFactory(
            "CredentialRegistry"
          );
          await expect(
            CredentialRegistryFactory.deploy(ethers.ZeroAddress)
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "CredentialRegistry__InvalidAddress"
          );
        });
      });

      describe("Role Management", function () {
        describe("Adding Issuers", function () {
          it("Should allow admin to add issuer", async function () {
            await expect(credentialRegistry.addIssuer(school1))
              .to.emit(credentialRegistry, "RoleGranted")
              .withArgs(ISSUER_ROLE, school1, deployer);

            expect(await credentialRegistry.isIssuer(school1)).to.be.true;
          });

          it("Should revert when non-admin tries to add issuer", async function () {
            await expect(
              credentialRegistry.connect(school1Signer).addIssuer(school2)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "AccessControlUnauthorizedAccount"
            );
          });

          it("Should revert when adding zero address as issuer", async function () {
            await expect(
              credentialRegistry.addIssuer(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidAddress"
            );
          });
        });

        describe("Removing Issuers", function () {
          beforeEach(async function () {
            await credentialRegistry.addIssuer(school1);
          });

          it("Should allow admin to remove issuer", async function () {
            await expect(credentialRegistry.removeIssuer(school1))
              .to.emit(credentialRegistry, "RoleRevoked")
              .withArgs(ISSUER_ROLE, school1, deployer);

            expect(await credentialRegistry.isIssuer(school1)).to.be.false;
          });

          it("Should revert when non-admin tries to remove issuer", async function () {
            await expect(
              credentialRegistry.connect(school1Signer).removeIssuer(school1)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "AccessControlUnauthorizedAccount"
            );
          });

          it("Should revert when removing zero address issuer", async function () {
            await expect(
              credentialRegistry.removeIssuer(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidAddress"
            );
          });
        });

        describe("Admin Self-Grant Issuer Role", function () {
          it("Should allow admin to grant themselves issuer role", async function () {
            await expect(credentialRegistry.adminGrantSelfIssuerRole())
              .to.emit(credentialRegistry, "RoleGranted")
              .withArgs(ISSUER_ROLE, deployer, deployer);

            expect(await credentialRegistry.isIssuer(deployer)).to.be.true;
          });

          it("Should revert when non-admin tries to self-grant issuer role", async function () {
            await expect(
              credentialRegistry
                .connect(school1Signer)
                .adminGrantSelfIssuerRole()
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "AccessControlUnauthorizedAccount"
            );
          });
        });
      });

      describe("Pausable Functionality", function () {
        beforeEach(async function () {
          await credentialRegistry.addIssuer(school1);
        });

        it("Should allow admin to pause contract", async function () {
          await expect(credentialRegistry.pause())
            .to.emit(credentialRegistry, "Paused")
            .withArgs(deployer);
        });

        it("Should allow admin to unpause contract", async function () {
          await credentialRegistry.pause();
          await expect(credentialRegistry.unpause())
            .to.emit(credentialRegistry, "Unpaused")
            .withArgs(deployer);
        });

        it("Should revert when non-admin tries to pause", async function () {
          await expect(
            credentialRegistry.connect(school1Signer).pause()
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "AccessControlUnauthorizedAccount"
          );
        });

        it("Should prevent credential issuance when paused", async function () {
          await credentialRegistry.pause();
          await expect(
            credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              )
          ).to.be.revertedWithCustomError(credentialRegistry, "EnforcedPause");
        });

        it("Should prevent credential revocation when paused", async function () {
          // Issue credential first
          const tx = await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );
          const receipt = await tx.wait();
          const credentialId = receipt.logs[0].args.credentialId;

          // Pause and try to revoke
          await credentialRegistry.pause();
          await expect(
            credentialRegistry
              .connect(school1Signer)
              .revokeCredential(credentialId, "Test revocation")
          ).to.be.revertedWithCustomError(credentialRegistry, "EnforcedPause");
        });
      });

      describe("Credential Issuance", function () {
        beforeEach(async function () {
          await credentialRegistry.addIssuer(school1);
          await credentialRegistry.addIssuer(school2);
        });

        describe("Successful Issuance", function () {
          it("Should issue credential with valid parameters", async function () {
            const tx = await credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              );

            const receipt = await tx.wait();
            const credentialId = receipt.logs[0].args.credentialId;

            await expect(tx)
              .to.emit(credentialRegistry, "CredentialIssued")
              .withArgs(
                credentialId,
                student1,
                school1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              );

            expect(await credentialRegistry.getTotalCredentials()).to.equal(1);
          });

          it("Should store credential data correctly", async function () {
            const tx = await credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              );
            const receipt = await tx.wait();
            const credentialId = receipt.logs[0].args.credentialId;

            const credential = await credentialRegistry.getCredential(
              credentialId
            );

            expect(credential.student).to.equal(student1);
            expect(credential.issuer).to.equal(school1);
            expect(credential.docHash).to.equal(sampleCredentials.docHash1);
            expect(credential.schema).to.equal(sampleCredentials.schema1);
            expect(credential.metadataURI).to.equal(
              sampleCredentials.metadataURI1
            );
            expect(credential.revoked).to.be.false;
            expect(credential.issuedAt).to.be.greaterThan(0);
          });

          it("Should update mappings correctly", async function () {
            const tx = await credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              );
            const receipt = await tx.wait();
            const credentialId = receipt.logs[0].args.credentialId;

            // Check docHash mapping
            const [credential, retrievedId] =
              await credentialRegistry.getCredentialByHash(
                sampleCredentials.docHash1
              );
            expect(retrievedId).to.equal(credentialId);

            // Check student credentials
            const studentCreds = await credentialRegistry.getStudentCredentials(
              student1
            );
            expect(studentCreds).to.include(credentialId);

            // Check issuer credentials
            const issuerCreds = await credentialRegistry.getIssuerCredentials(
              school1
            );
            expect(issuerCreds).to.include(credentialId);
          });

          it("Should generate unique credential IDs", async function () {
            const tx1 = await credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              );
            const receipt1 = await tx1.wait();
            const credentialId1 = receipt1.logs[0].args.credentialId;

            const tx2 = await credentialRegistry
              .connect(school2Signer)
              .issueCredential(
                student2,
                sampleCredentials.docHash2,
                sampleCredentials.schema2,
                sampleCredentials.metadataURI2
              );
            const receipt2 = await tx2.wait();
            const credentialId2 = receipt2.logs[0].args.credentialId;

            expect(credentialId1).to.not.equal(credentialId2);
          });
        });

        describe("Input Validation", function () {
          it("Should revert with invalid student address", async function () {
            await expect(
              credentialRegistry
                .connect(school1Signer)
                .issueCredential(
                  ethers.ZeroAddress,
                  sampleCredentials.docHash1,
                  sampleCredentials.schema1,
                  sampleCredentials.metadataURI1
                )
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidStudent"
            );
          });

          it("Should revert with invalid docHash", async function () {
            await expect(
              credentialRegistry
                .connect(school1Signer)
                .issueCredential(
                  student1,
                  ethers.ZeroHash,
                  sampleCredentials.schema1,
                  sampleCredentials.metadataURI1
                )
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidDocHash"
            );
          });

          it("Should revert with empty schema", async function () {
            await expect(
              credentialRegistry
                .connect(school1Signer)
                .issueCredential(
                  student1,
                  sampleCredentials.docHash1,
                  "",
                  sampleCredentials.metadataURI1
                )
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__EmptySchema"
            );
          });

          it("Should revert with empty metadata URI", async function () {
            await expect(
              credentialRegistry
                .connect(school1Signer)
                .issueCredential(
                  student1,
                  sampleCredentials.docHash1,
                  sampleCredentials.schema1,
                  ""
                )
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__EmptyMetadataURI"
            );
          });

          it("Should revert when issuing duplicate docHash", async function () {
            await credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              );

            await expect(
              credentialRegistry
                .connect(school2Signer)
                .issueCredential(
                  student2,
                  sampleCredentials.docHash1,
                  sampleCredentials.schema2,
                  sampleCredentials.metadataURI2
                )
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__CredentialAlreadyIssued"
            );
          });
        });

        describe("Authorization", function () {
          it("Should revert when non-issuer tries to issue credential", async function () {
            const randomUserSigner = await ethers.getSigner(randomUser);
            await expect(
              credentialRegistry
                .connect(randomUserSigner)
                .issueCredential(
                  student1,
                  sampleCredentials.docHash1,
                  sampleCredentials.schema1,
                  sampleCredentials.metadataURI1
                )
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "AccessControlUnauthorizedAccount"
            );
          });
        });
      });

      describe("Credential Revocation", function () {
        let credentialId;

        beforeEach(async function () {
          await credentialRegistry.addIssuer(school1);
          await credentialRegistry.addIssuer(school2);

          const tx = await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );
          const receipt = await tx.wait();
          credentialId = receipt.logs[0].args.credentialId;
        });

        it("Should allow issuer to revoke their own credential", async function () {
          await expect(
            credentialRegistry
              .connect(school1Signer)
              .revokeCredential(credentialId, "Test revocation")
          )
            .to.emit(credentialRegistry, "CredentialRevoked")
            .withArgs(
              credentialId,
              school1,
              sampleCredentials.docHash1,
              "Test revocation"
            );

          const credential = await credentialRegistry.getCredential(
            credentialId
          );
          expect(credential.revoked).to.be.true;
        });

        it("Should clear docHash mapping when credential is revoked", async function () {
          await credentialRegistry
            .connect(school1Signer)
            .revokeCredential(credentialId, "Test revocation");

          const [, retrievedId] = await credentialRegistry.getCredentialByHash(
            sampleCredentials.docHash1
          );
          expect(retrievedId).to.equal(ethers.ZeroHash);
        });

        it("Should revert when trying to revoke non-existent credential", async function () {
          const fakeCredentialId = ethers.keccak256(ethers.toUtf8Bytes("fake"));

          await expect(
            credentialRegistry
              .connect(school1Signer)
              .revokeCredential(fakeCredentialId, "Test")
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "CredentialRegistry__CredentialNotFound"
          );
        });

        it("Should revert when trying to revoke already revoked credential", async function () {
          await credentialRegistry
            .connect(school1Signer)
            .revokeCredential(credentialId, "First revocation");

          await expect(
            credentialRegistry
              .connect(school1Signer)
              .revokeCredential(credentialId, "Second revocation")
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "CredentialRegistry__AlreadyRevoked"
          );
        });

        it("Should revert when non-issuer tries to revoke credential", async function () {
          const randomUserSigner = await ethers.getSigner(randomUser);
          await expect(
            credentialRegistry
              .connect(randomUserSigner)
              .revokeCredential(credentialId, "Test")
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "CredentialRegistry__NotAuthorized"
          );
        });

        it("Should allow different issuer with ISSUER_ROLE to revoke credential", async function () {
          // School2 has ISSUER_ROLE, so it should be able to revoke school1's credential
          await expect(
            credentialRegistry
              .connect(school2Signer)
              .revokeCredential(credentialId, "Revoked by different issuer")
          )
            .to.emit(credentialRegistry, "CredentialRevoked")
            .withArgs(
              credentialId,
              school2,
              sampleCredentials.docHash1,
              "Revoked by different issuer"
            );

          const credential = await credentialRegistry.getCredential(
            credentialId
          );
          expect(credential.revoked).to.be.true;
        });
      });

      describe("Credential Validation", function () {
        let credentialId;

        beforeEach(async function () {
          await credentialRegistry.addIssuer(school1);

          const tx = await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );
          const receipt = await tx.wait();
          credentialId = receipt.logs[0].args.credentialId;
        });

        it("Should return true for valid credential", async function () {
          expect(await credentialRegistry.isValid(sampleCredentials.docHash1))
            .to.be.true;
        });

        it("Should return false for non-existent credential", async function () {
          expect(await credentialRegistry.isValid(sampleCredentials.docHash2))
            .to.be.false;
        });

        it("Should return false for revoked credential", async function () {
          await credentialRegistry
            .connect(school1Signer)
            .revokeCredential(credentialId, "Test revocation");
          expect(await credentialRegistry.isValid(sampleCredentials.docHash1))
            .to.be.false;
        });
      });

      describe("Getter Functions", function () {
        beforeEach(async function () {
          await credentialRegistry.addIssuer(school1);
          await credentialRegistry.addIssuer(school2);

          // Issue multiple credentials
          await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );

          await credentialRegistry
            .connect(school2Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash2,
              sampleCredentials.schema2,
              sampleCredentials.metadataURI2
            );
        });

        describe("getStudentCredentials", function () {
          it("Should return all credentials for a student", async function () {
            const studentCreds = await credentialRegistry.getStudentCredentials(
              student1
            );
            expect(studentCreds.length).to.equal(2);
          });

          it("Should return empty array for student with no credentials", async function () {
            const studentCreds = await credentialRegistry.getStudentCredentials(
              student2
            );
            expect(studentCreds.length).to.equal(0);
          });

          it("Should revert with zero address", async function () {
            await expect(
              credentialRegistry.getStudentCredentials(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidAddress"
            );
          });
        });

        describe("getIssuerCredentials", function () {
          it("Should return all credentials for an issuer", async function () {
            const issuerCreds = await credentialRegistry.getIssuerCredentials(
              school1
            );
            expect(issuerCreds.length).to.equal(1);
          });

          it("Should return empty array for issuer with no credentials", async function () {
            await credentialRegistry.addIssuer(randomUser);
            const issuerCreds = await credentialRegistry.getIssuerCredentials(
              randomUser
            );
            expect(issuerCreds.length).to.equal(0);
          });

          it("Should revert with zero address", async function () {
            await expect(
              credentialRegistry.getIssuerCredentials(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidAddress"
            );
          });
        });

        describe("getCredential", function () {
          it("Should return correct credential data", async function () {
            const studentCreds = await credentialRegistry.getStudentCredentials(
              student1
            );
            const credential = await credentialRegistry.getCredential(
              studentCreds[0]
            );

            expect(credential.student).to.equal(student1);
            expect(credential.issuer).to.equal(school1);
            expect(credential.docHash).to.equal(sampleCredentials.docHash1);
            expect(credential.schema).to.equal(sampleCredentials.schema1);
            expect(credential.metadataURI).to.equal(
              sampleCredentials.metadataURI1
            );
            expect(credential.revoked).to.be.false;
          });

          it("Should revert for non-existent credential", async function () {
            const fakeCredentialId = ethers.keccak256(
              ethers.toUtf8Bytes("fake")
            );

            await expect(
              credentialRegistry.getCredential(fakeCredentialId)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__CredentialNotFound"
            );
          });
        });

        describe("getCredentialByHash", function () {
          it("Should return correct credential by docHash", async function () {
            const [credential, credentialId] =
              await credentialRegistry.getCredentialByHash(
                sampleCredentials.docHash1
              );

            expect(credential.student).to.equal(student1);
            expect(credential.issuer).to.equal(school1);
            expect(credential.docHash).to.equal(sampleCredentials.docHash1);
            expect(credentialId).to.not.equal(ethers.ZeroHash);
          });

          it("Should return empty credential for non-existent docHash", async function () {
            const fakeDocHash = ethers.keccak256(ethers.toUtf8Bytes("fake"));
            const [credential, credentialId] =
              await credentialRegistry.getCredentialByHash(fakeDocHash);

            expect(credential.issuer).to.equal(ethers.ZeroAddress);
            expect(credentialId).to.equal(ethers.ZeroHash);
          });
        });

        describe("getTotalCredentials", function () {
          it("Should return correct total count", async function () {
            expect(await credentialRegistry.getTotalCredentials()).to.equal(2);
          });
        });

        describe("isIssuer", function () {
          it("Should return true for authorized issuer", async function () {
            expect(await credentialRegistry.isIssuer(school1)).to.be.true;
          });

          it("Should return false for non-issuer", async function () {
            expect(await credentialRegistry.isIssuer(randomUser)).to.be.false;
          });
        });
      });

      describe("Edge Cases", function () {
        beforeEach(async function () {
          await credentialRegistry.addIssuer(school1);
        });

        it("Should handle multiple credentials for same student", async function () {
          await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );

          await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash2,
              sampleCredentials.schema2,
              sampleCredentials.metadataURI2
            );

          const studentCreds = await credentialRegistry.getStudentCredentials(
            student1
          );
          expect(studentCreds.length).to.equal(2);
        });

        it("Should allow reissuing after revocation", async function () {
          // Issue credential
          const tx1 = await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );
          const receipt1 = await tx1.wait();
          const credentialId1 = receipt1.logs[0].args.credentialId;

          // Revoke credential
          await credentialRegistry
            .connect(school1Signer)
            .revokeCredential(credentialId1, "Test revocation");

          // Should be able to issue new credential with same docHash
          await expect(
            credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              )
          ).to.not.be.reverted;
        });
      });
    });
